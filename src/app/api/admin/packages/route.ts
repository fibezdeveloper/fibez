import { requireRole } from '@/lib/dal';
import { connection, NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';
import { LIVE_V2RAY_PACKAGES, V2RAY_QUOTA_TIERS, normalizeIsp, V2RayPackageDef } from '@/lib/v2ray-catalog';
import { getResolvedPackages } from '@/lib/package-list';

// Full package list including routing details (SNI, panel inbound id): staff only.
// The public storefront reads /api/packages instead, which leaves those fields out.
export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  await connection(); // always read at request time, never frozen into the build
  try {
    const packages = await getResolvedPackages();
    return NextResponse.json({
      success: true,
      packages,
      quotaTiers: V2RAY_QUOTA_TIERS,
      activeCount: packages.filter((p) => p.isActive).length,
      totalCount: packages.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));

    // Action: Reset packages to factory default catalog
    if (body.action === 'reset_defaults') {
      await adminStore.resetPackages();
      return NextResponse.json({
        success: true,
        message: 'Packages reset to official factory catalog!',
      });
    }

    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    if (!rawTitle) {
      return NextResponse.json({ error: 'Package title is required' }, { status: 400 });
    }

    const isp = normalizeIsp(body.isp || 'Dialog');
    const slugBase = `${isp.toLowerCase()}-${rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const id = (body.id && String(body.id).trim()) || `${slugBase}-${Date.now().toString(36).slice(-4)}`;

    const port = Number(body.inboundPort || body.port) || 443;
    const inboundId = Number(body.inboundId) || (port === 445 ? 1 : 3);

    const newPkg: V2RayPackageDef & { sni: string } = {
      id,
      title: rawTitle,
      isp,
      categoryLabel: body.categoryLabel?.trim() || 'Home Broadband',
      reloadCode: body.reloadCode?.trim() || '',
      targetMedium: body.targetMedium || 'Home Broadband Router',
      carrierSpeedNote: body.carrierSpeedNote?.trim() || 'Unmetered · No Carrier Speed Limit',
      sni: body.sni?.trim() || 'zoom.us',
      inboundPort: port,
      inboundId,
      badge: body.badge?.trim() || '',
      isPopular: Boolean(body.isPopular),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      description: body.description?.trim() || `${rawTitle} high-speed carrier bypass node.`,
      hasSriLankanIpOption: body.serverType === 'LK_IP',
      serverType: body.serverType === 'LK_IP' ? 'LK_IP' : 'STANDARD',
      torrentPolicy: 'Blocked',
      deviceLogins: 'Unlimited Devices (Shared Quota)',
      validityDays: 30,
      standardPriceAdjustmentLKR: Number(body.standardPriceAdjustmentLKR) || 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const saved = await adminStore.addCustomPackage(newPkg);

    return NextResponse.json({
      success: true,
      message: `Package "${saved.title}" created successfully!`,
      package: saved,
    });
  } catch (error: any) {
    console.error('Error creating admin package:', error);
    return NextResponse.json({ error: error.message || 'Failed to create package' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    if (body.action === 'toggle_active') {
      const activeState = await adminStore.togglePackageActive(id);
      return NextResponse.json({
        success: true,
        message: `Package visibility toggled to ${activeState ? 'ACTIVE' : 'HIDDEN'}`,
        isActive: activeState,
      });
    }

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.isp !== undefined) updates.isp = normalizeIsp(body.isp);
    if (body.categoryLabel !== undefined) updates.categoryLabel = body.categoryLabel.trim();
    if (body.reloadCode !== undefined) updates.reloadCode = body.reloadCode.trim();
    if (body.carrierSpeedNote !== undefined) updates.carrierSpeedNote = body.carrierSpeedNote.trim();
    if (body.sni !== undefined) updates.sni = body.sni.trim();
    if (body.inboundPort !== undefined || body.port !== undefined) {
      updates.inboundPort = Number(body.inboundPort || body.port);
    }
    if (body.inboundId !== undefined) updates.inboundId = Number(body.inboundId);
    if (body.badge !== undefined) updates.badge = body.badge.trim();
    if (body.standardPriceAdjustmentLKR !== undefined) {
      updates.standardPriceAdjustmentLKR = Number(body.standardPriceAdjustmentLKR) || 0;
    }
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.targetMedium !== undefined) updates.targetMedium = body.targetMedium;
    if (body.serverType !== undefined) updates.serverType = body.serverType;

    const updated = await adminStore.updatePackageOverride(id, updates);

    return NextResponse.json({
      success: true,
      message: `Package "${id}" updated successfully!`,
      override: updated,
    });
  } catch (error: any) {
    console.error('Error updating admin package:', error);
    return NextResponse.json({ error: error.message || 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    await adminStore.deletePackage(id);

    return NextResponse.json({
      success: true,
      message: `Package "${id}" removed successfully!`,
    });
  } catch (error: any) {
    console.error('Error deleting admin package:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete package' }, { status: 500 });
  }
}
