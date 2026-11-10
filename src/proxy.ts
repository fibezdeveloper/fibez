import { auth } from '@/lib/auth';

export default auth.middleware({
  loginUrl: '/login',
  publicRoutes: [
    '/',
    '/catalog',
    '/products',
    '/v2ray',
    '/cart',
    '/vault',
    '/docs',
    '/infrastructure',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/refund',
    '/terms',
    '/tickets',
    '/api',
  ],
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$).*)',
  ],
};
