import { auth } from '@/lib/auth';

// All authentication is handled by Neon Auth (Better Auth). Sessions are issued and
// verified by the auth server; nothing here mints sessions or trusts client cookies.
export const { GET, POST } = auth.handler();
