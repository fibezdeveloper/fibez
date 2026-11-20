import { requireRole } from '@/lib/dal';
import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';
import { PRODUCTS } from '@/lib/products';

// Helper to normalize legacy product IDs to current catalog items
function findCatalogProduct(productId: string, title?: string) {
  const normId = (productId || '').toLowerCase();
  const normTitle = (title || '').toLowerCase();

  // 1. Direct ID match
  let found = PRODUCTS.find((p) => p.id === productId);
  if (found) return found;

  // 2. Known alias mappings
  if (normId.includes('canva') || normTitle.includes('canva')) {
    return PRODUCTS.find((p) => p.id === 'canva-pro-activation') || PRODUCTS.find((p) => p.id === 'canva-pro-1year');
  }
  if (normId.includes('capcut') || normTitle.includes('capcut')) {
    return PRODUCTS.find((p) => p.id === 'capcut-pro-subscription');
  }
  if (normId.includes('steam') || normTitle.includes('steam')) {
    return PRODUCTS.find((p) => p.id === 'steam-wallet-code-global');
  }
  if (normId.includes('playstation') || normId.includes('psn') || normTitle.includes('playstation')) {
    return PRODUCTS.find((p) => p.id === 'psn-wallet-card-us');
  }
  if (normId.includes('nintendo') || normTitle.includes('nintendo')) {
    return PRODUCTS.find((p) => p.id === 'nintendo-eshop-gift-card');
  }
  if (normId.includes('amazon') || normTitle.includes('amazon')) {
    return PRODUCTS.find((p) => p.id === 'amazon-gift-card-us');
  }

  // 3. Fallback title search
  return PRODUCTS.find(
    (p) =>
      p.title.toLowerCase().includes(normTitle) ||
      (normTitle && normTitle.includes(p.title.toLowerCase()))
  );
}

export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const rawItems = await adminStore.getInventory();

    // Map items with catalog product details
    const items = rawItems.map((it) => {
      const match = findCatalogProduct(it.productId, it.productTitle);
      return {
        ...it,
        matchedProductId: match?.id || it.productId,
        productBrand: match?.brand || 'Digital Asset',
        productCategory: match?.category || 'software',
        productRegion: match?.region || 'Global',
        productPriceUSD: match?.priceUSD || 0,
        productPriceLKR: match?.priceLKR || 0,
      };
    });

    // Stock Summary per Product
    const stockSummary: Record<string, any> = {};

    // Seed all digital catalog products
    for (const prod of PRODUCTS.filter((p) => p.category !== 'vpn')) {
      stockSummary[prod.id] = {
        productId: prod.id,
        title: prod.title,
        brand: prod.brand,
        category: prod.category,
        region: prod.region,
        priceUSD: prod.priceUSD,
        priceLKR: prod.priceLKR,
        available: 0,
        dispensed: 0,
        total: 0,
      };
    }

    for (const it of items) {
      const targetId = it.matchedProductId || it.productId;
      if (!stockSummary[targetId]) {
        stockSummary[targetId] = {
          productId: targetId,
          title: it.productTitle,
          brand: it.productBrand,
          category: it.productCategory,
          region: it.productRegion,
          priceUSD: it.productPriceUSD,
          priceLKR: it.productPriceLKR,
          available: 0,
          dispensed: 0,
          total: 0,
        };
      }
      stockSummary[targetId].total++;
      if (it.status === 'AVAILABLE') stockSummary[targetId].available++;
      if (it.status === 'DISPENSED') stockSummary[targetId].dispensed++;
    }

    // Sort summary: In-stock items first, then by total stock, then alphabetically
    const sortedSummary = Object.values(stockSummary).sort((a: any, b: any) => {
      if (b.available !== a.available) return b.available - a.available;
      if (b.total !== a.total) return b.total - a.total;
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({
      success: true,
      items,
      summary: sortedSummary,
    });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const stockType = body.stockType || 'SERIAL_KEY';
    const rawKeysText = typeof body.rawKeysText === 'string' ? body.rawKeysText : '';
    const batchReference = body.batchReference || `BATCH-${Date.now().toString().slice(-6)}`;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const prod = PRODUCTS.find((p) => p.id === productId);
    const productTitle = prod ? prod.title : productId;

    const lines = rawKeysText
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: 'No valid keys or accounts found in payload' }, { status: 400 });
    }

    const count = await adminStore.addInventoryBatch(
      productId,
      productTitle,
      stockType,
      lines,
      batchReference
    );

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${count} new digital stock item(s) for "${productTitle}"!`,
      addedCount: count,
    });
  } catch (error: any) {
    console.error('Error adding inventory batch:', error);
    return NextResponse.json({ error: error.message || 'Failed to add inventory' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const { id, action } = body;

    // Reset whole inventory to empty state
    if (action === 'clear_all') {
      await adminStore.clearAllInventory();
      return NextResponse.json({
        success: true,
        message: 'All inventory stock in the vault has been completely wiped.',
      });
    }

    // Reset back to default catalog seeds
    if (action === 'reset_seed') {
      await adminStore.resetInventoryToSeed();
      return NextResponse.json({
        success: true,
        message: 'Inventory has been reset to default catalog seeds (Canva, CapCut, Steam).',
      });
    }

    // Clear only dispensed / redeemed items
    if (action === 'clear_dispensed') {
      const removed = await adminStore.clearDispensedInventory();
      return NextResponse.json({
        success: true,
        message: `Removed ${removed} dispensed item(s) from vault history.`,
        removedCount: removed,
      });
    }

    // Delete single item by ID
    if (id) {
      const ok = await adminStore.deleteInventoryItem(id);
      if (ok) {
        return NextResponse.json({
          success: true,
          message: 'Stock item deleted from vault successfully.',
        });
      } else {
        return NextResponse.json({ error: 'Stock item not found or already deleted' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Missing item ID or valid reset action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete inventory' }, { status: 500 });
  }
}
