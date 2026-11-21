import { adminStore, type AdminOrder } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import { buildVlessUri } from '@/lib/v2ray-inbounds';
import { resolveV2RayProvisioning } from '@/lib/pricing';
import { PRODUCTS } from '@/lib/products';
import { dbReady } from '@/lib/db/tx';
import { recordPanelClients, markPanelClientsRevoked, getPanelClientsByOrder } from '@/lib/wallet';
import { dbReleaseStockForOrder } from '@/lib/store-db';

export interface PanelClientRef {
  email: string;
  uuid: string;
  itemId?: string;
  inboundId?: number;
  expiresAt?: string;
}

export type FulfillResult =
  | { ok: true; itemKeys: Record<string, string>; panelClients: PanelClientRef[]; dispensedPayload: string }
  | { ok: false; status: number; error: string };

/**
 * Turns a PAID order into delivered products: creates the V2Ray clients on the panel (package inbound,
 * plan quota, months paid) and/or dispenses real stock keys. Never invents a key or config:
 * if anything fails it undoes what it did and reports why.
 */
export async function fulfillOrder(order: AdminOrder, manualKeys: Record<string, string> = {}): Promise<FulfillResult> {
  const itemKeys: Record<string, string> = {};
  const panelClients: PanelClientRef[] = [];
  const dispensedStockForOrder = { n: 0 };
  const provisionExtra = {
    overrides: await adminStore.getPackageOverrides(),
    customPackages: await adminStore.getCustomPackages(),
  };
  const emailTag = order.customerEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  const undo = async () => {
    for (const c of panelClients) await xui.deleteClient(c.email).catch(() => false);
    if (dispensedStockForOrder.n > 0 && dbReady()) await dbReleaseStockForOrder(order.id).catch(() => {});
  };

  for (let idx = 0; idx < order.items.length; idx++) {
    const item = order.items[idx];
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const isV2Ray =
      item.productId.startsWith('v2ray') ||
      (prod && prod.category === 'vpn') ||
      item.productTitle.toLowerCase().includes('vless') ||
      item.productTitle.toLowerCase().includes('v2ray');
    const qty = Math.max(1, Math.min(20, Math.round(item.quantity || 1)));
    const delivered: string[] = [];

    if (isV2Ray) {
      const spec = resolveV2RayProvisioning(item.productId, provisionExtra);
      const isRenewal = idx === 0 && Boolean(order.renewOrderId || order.existingUuid || order.reviewNotes?.includes('RENEW:'));

      if (isRenewal && order.existingUuid) {
        try {
          const existing = await xui.getClient(order.existingUuid);
          if (existing) await xui.resetClientTraffic(existing.email);
        } catch (xErr) {
          console.warn('3x-ui renewal traffic reset note:', xErr);
        }
        delivered.push(
          buildVlessUri({
            uuid: order.existingUuid,
            host: spec.host || xui.getPublicHost(),
            port: spec.port,
            sni: spec.sni,
            remark: `${spec.remarkName} (${order.orderNumber}-RENEW)`,
          })
        );
      } else {
        for (let n = 0; n < qty; n++) {
          const clientEmail = `${order.orderNumber}-${idx + 1}${qty > 1 ? `-${n + 1}` : ''}_${emailTag}`;
          try {
            const client = await xui.createClient({
              email: clientEmail,
              inboundId: spec.inboundId,
              totalGB: spec.totalBytes,
              expiryDays: spec.expiryDays,
              limitIp: spec.limitIp,
              comment: `Order ${order.orderNumber} - ${order.customerName} (${order.customerEmail})`,
            });
            panelClients.push({
              email: clientEmail,
              uuid: client.uuid,
              itemId: item.id,
              inboundId: spec.inboundId,
              expiresAt: new Date(Date.now() + spec.expiryDays * 86400000).toISOString(),
            });
            delivered.push(
              buildVlessUri({
                uuid: client.uuid,
                host: spec.host || xui.getPublicHost(),
                port: spec.port,
                sni: spec.sni,
                remark: `${spec.remarkName} (${order.orderNumber})`,
              })
            );
          } catch (xErr) {
            console.error('3x-ui provisioning failed:', xErr);
            await undo();
            return {
              ok: false,
              status: 502,
              error: 'Could not create the client on the V2Ray panel. Nothing was delivered; check the panel connection and retry.',
            };
          }
        }
      }
    } else {
      // Real stock only. Staff may paste keys via manualKeys; otherwise it comes from Inventory.
      const manual = String(manualKeys[item.id] || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      for (let n = 0; n < qty; n++) {
        if (manual[n]) {
          delivered.push(manual[n]);
          continue;
        }
        const inv = await adminStore.dispenseStockItem(item.productId, order.id, order.customerEmail);
        if (!inv) {
          await undo();
          return {
            ok: false,
            status: 409,
            error: `No stock available for "${item.productTitle}". Add stock in Inventory (or provide the key manually) and try again.`,
          };
        }
        dispensedStockForOrder.n++;
        delivered.push(inv.keyPayload);
      }
    }
    itemKeys[item.id] = delivered.join('\n');
  }

  return { ok: true, itemKeys, panelClients, dispensedPayload: Object.values(itemKeys).join('\n') };
}

/** Record the panel clients of a fulfilled order (DB table, used for refunds / renewals). */
export async function recordFulfilledClients(order: AdminOrder, clients: PanelClientRef[]) {
  if (!dbReady() || clients.length === 0) return;
  await recordPanelClients(
    clients.map((c) => ({
      orderNumber: order.orderNumber,
      itemId: c.itemId,
      userEmail: order.customerEmail,
      email: c.email,
      uuid: c.uuid,
      inboundId: c.inboundId,
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined,
    }))
  );
}

/** Delete every panel client that belongs to an order (reject / refund / revoke). Returns how many were removed. */
export async function revokeOrderLines(order: AdminOrder): Promise<number> {
  const emails = new Set<string>();
  for (const c of order.metadata?.panelClients || []) emails.add(c.email);
  if (dbReady()) {
    for (const c of await getPanelClientsByOrder(order.orderNumber)) if (c.status === 'ACTIVE') emails.add(c.email);
  }
  let removed = 0;
  for (const email of emails) if (await xui.deleteClient(email)) removed++;
  if (dbReady()) await markPanelClientsRevoked(order.orderNumber).catch(() => {});
  return removed;
}
