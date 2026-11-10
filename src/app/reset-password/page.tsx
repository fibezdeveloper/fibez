'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient, extractAuthErrorMessage } from '@/lib/auth-client';
import FibezLogo from '@/components/FibezLogo';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const urlError = searchParams.get('error');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetDone, setIsResetDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (resetError) {
        setError(
          extractAuthErrorMessage(
            resetError,
            'Your reset token is invalid or has expired. Please request a new link.'
          )
        );
        setIsLoading(false);
        return;
      }

      setIsResetDone(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      setError(extractAuthErrorMessage(err, 'Unable to update password. Please try again.'));
      setIsLoading(false);
    }
  };

  const tokenInvalid = Boolean(urlError) || !token;

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-24">
      <div className="w-full max-w-md flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
        <Link href="/login" className="hover:text-white transition-colors">
          Sign In
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
        <span className="text-zinc-300">Reset Password</span>
      </div>

      <div className="w-full max-w-md bg-[#0a0a0d] border border-[#1f2127] rounded-[24px] shadow-2xl p-7 sm:p-9 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <FibezLogo size="md" withVersion={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-white">
            Set a new password
          </h1>
          <p className="text-xs text-[#a1a4a5] mt-2 leading-relaxed">
            Choose a strong password for your Fibez account.
          </p>
        </div>

        {tokenInvalid ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#1d0e11] border border-[#ff453a]/30 text-xs text-[#ff8077] font-mono flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#ff453a] mt-0.5" />
              <span>
                This password reset link is invalid or has expired (links stay valid for 15 minutes).
              </span>
            </div>

            <Link
              href="/login?mode=forgot"
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Request New Reset Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : isResetDone ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#0b1912] border border-[#3ad389]/30 text-xs text-zinc-200 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-[#3ad389] font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password Updated</span>
              </div>
              <p>
                Your password has been updated cleanly. Redirecting you to Sign In...
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#1d0e11] border border-[#ff453a]/30 text-xs text-[#ff8077] font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ff453a] mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] font-mono text-zinc-500 mt-1">
                Minimum 8 characters.
              </p>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Update Password ›</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-zinc-500 font-mono text-xs">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
