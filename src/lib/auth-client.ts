'use client';

import { createAuthClient } from '@neon/auth/next';

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Extracts a human-readable error message from either Better Auth's
 * `{ error }` result object or a thrown Neon Auth `AuthHttpError`.
 */
export function extractAuthErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const anyErr = err as {
      message?: string;
      error?: { message?: string };
    };
    if (anyErr.error?.message) return anyErr.error.message;
    if (anyErr.message) return anyErr.message;
  }
  return fallback;
}
