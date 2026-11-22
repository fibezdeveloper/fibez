import { connection, NextResponse } from 'next/server';
import { getResolvedPackages, toPublicPackage } from '@/lib/package-list';
import { V2RAY_QUOTA_TIERS } from '@/lib/v2ray-catalog';

// Public storefront catalog. Routing details (SNI, panel inbound id) are left out on purpose:
// they are only in /api/admin/packages, which needs an admin or owner session.
export async function GET() {
  await connection(); // always read at request time, never frozen into the build
  try {
    const packages = (await getResolvedPackages()).map(toPublicPackage);
    return NextResponse.json({
      success: true,
      packages,
      quotaTiers: V2RAY_QUOTA_TIERS,
      activeCount: packages.filter((p) => p.isActive).length,
      totalCount: packages.length,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}
