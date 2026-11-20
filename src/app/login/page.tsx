'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient, extractAuthErrorMessage } from '@/lib/auth-client';
import FibezLogo from '@/components/FibezLogo';
import {
  Lock,
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: 'Google sign-in could not be completed. Verify your Google OAuth credentials and redirect URI.',
  account_not_linked:
    'An account with this email already exists with password login. Sign in with your email and password instead.',
  access_denied: 'Google sign-in was cancelled.',
  state_mismatch: 'Your sign-in session expired. Please try continuing with Google again.',
};

function resolveCallbackUrl(rawCallback: string): string {
  if (typeof window === 'undefined') return rawCallback;
  if (rawCallback.startsWith('http://') || rawCallback.startsWith('https://')) {
    return rawCallback;
  }
  const normalized = rawCallback.startsWith('/') ? rawCallback : `/${rawCallback}`;
  return `${window.location.origin}${normalized}`;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMode = searchParams.get('mode');
  const initialMode: AuthMode =
    rawMode === 'register' ? 'register' : rawMode === 'forgot' ? 'forgot' : 'login';
  const callbackUrl = searchParams.get('callbackUrl') || '/vault';

  const { data: session } = authClient.useSession();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'register') setMode('register');
    else if (qMode === 'forgot') setMode('forgot');
    else if (qMode === 'login') setMode('login');

    const qErr = searchParams.get('error');
    if (qErr) {
      setError(
        OAUTH_ERROR_MESSAGES[qErr] ||
          `Authentication error (${qErr}). Please try again.`
      );
    }
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: resolveCallbackUrl(callbackUrl),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.user || data.url) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(data.url || callbackUrl);
        }, 500);
        return;
      }
      setError('Unable to authenticate with Google. Try direct email sign in.');
    } catch (err: unknown) {
      setError(extractAuthErrorMessage(err, 'Google sign-in encountered an error.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevQuickSignIn = async (userEmail = 'akain@fibez.store') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'dev-master-password' }),
      });
      const data = await res.json();
      if (data.user) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl === '/vault' && userEmail.includes('akain') ? '/admin' : callbackUrl);
        }, 500);
      } else {
        setError('Dev sign-in failed');
      }
    } catch (e: any) {
      setError(e.message || 'Dev sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        setForgotSent(true);
        setIsLoading(false);
        return;
      }

      const endpoint = mode === 'login' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email';
      const payload =
        mode === 'login'
          ? { email: email.trim(), password }
          : { email: email.trim(), password, name: name.trim() || email.split('@')[0] };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign-in request timed out after 6 seconds')), 6000)
      );

      const fetchPromise = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Authentication failed');
        }
        return res.json();
      });

      const result: any = await Promise.race([fetchPromise, timeoutPromise]);

      if (result && result.user) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 600);
      } else {
        setError('Invalid credentials. Please verify your email and password.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(extractAuthErrorMessage(err, 'Authentication failed. Please try again.'));
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const switchMode = (nextMode: AuthMode) => {
    setError(null);
    setForgotSent(false);
    setMode(nextMode);
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-md flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
        <span className="text-zinc-300">
          {mode === 'login'
            ? 'Sign In'
            : mode === 'register'
            ? 'Register'
            : 'Forgot Password'}
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-[#0a0a0d] border border-[#1f2127] rounded-[24px] shadow-2xl p-7 sm:p-9 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative top rim glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* If already authenticated, show user status card */}
        {session?.user ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-1">
                Authenticated Session
              </div>
              <h2 className="text-2xl font-normal text-white">
                Welcome back, {session.user.name || session.user.email?.split('@')[0]}
              </h2>
              <p className="text-xs font-mono text-zinc-500 mt-1">
                {session.user.email} • Role:{' '}
                <span className="uppercase text-zinc-300 font-semibold">
                  {(session.user as any).role || 'user'}
                </span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {((session.user as any).role === 'owner' || (session.user as any).role === 'admin' || session.user.email?.includes('akain') || session.user.email?.includes('admin')) ? (
                <Link
                  href="/admin"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3ad389]/20 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Master Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}

              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-black" />
                <span>Open Client Console Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/vault"
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>My Key Vault &amp; Delivered Orders</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 text-xs font-mono text-zinc-500 hover:text-[#ff453a] transition-colors flex items-center justify-center gap-1.5 cursor-pointer pt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Brand & Heading */}
            <div className="mb-7 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <FibezLogo size="md" withVersion={false} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-white">
                {mode === 'login'
                  ? 'Log in to your vault'
                  : mode === 'register'
                  ? 'Create Fibez account'
                  : 'Reset your password'}
              </h1>
              <p className="text-xs text-[#a1a4a5] mt-2 leading-relaxed">
                {mode === 'login'
                  ? 'Access your VLESS configs, active orders, and digital vault.'
                  : mode === 'register'
                  ? 'Instant automated delivery to your email and Key Vault.'
                  : 'Enter your account email and we will send a password reset link via Resend.'}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-[#1d0e11] border border-[#ff453a]/30 text-xs text-[#ff8077] font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ff453a] mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-zinc-500 hover:text-white shrink-0 ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {mode === 'forgot' && forgotSent ? (
              <div className="space-y-5 py-2">
                <div className="p-4 rounded-xl bg-[#0b1912] border border-[#3ad389]/30 text-xs text-zinc-200 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 text-[#3ad389] font-mono font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Reset Link Dispatched</span>
                  </div>
                  <p>
                    If an account exists for <strong className="text-white">{email}</strong>,
                    check your inbox (and spam folder) for your 15-minute password reset link.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            ) : (
              <>
                {mode !== 'forgot' && (
                  <>
                    {/* Google Social Authentication */}
                    <div className="mb-6">
                      <button
                        type="button"
                        disabled={isLoading || isSuccess}
                        onClick={handleGoogleAuth}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs text-[#f0f0f0] font-mono transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex py-2 items-center mb-6">
                      <div className="flex-grow border-t border-[#1f2127]" />
                      <span className="flex-shrink mx-3 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                        or email
                      </span>
                      <div className="flex-grow border-t border-[#1f2127]" />
                    </div>
                  </>
                )}

                {/* Email / Password / Forgot Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block font-mono text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                        />
                        <User className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@fibez.store"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                      />
                      <Mail className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          minLength={mode === 'register' ? 8 : undefined}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                        />
                        <Lock className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
                      </div>
                      {mode === 'register' && (
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">
                          Minimum 8 characters required.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-black" />
                        <span>Authenticated Successfully</span>
                      </span>
                    ) : isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>
                          {mode === 'forgot' ? 'Sending Reset Email...' : 'Verifying Credentials...'}
                        </span>
                      </span>
                    ) : (
                      <span>
                        {mode === 'login'
                          ? 'Sign In'
                          : mode === 'register'
                          ? 'Create Account'
                          : 'Send Reset Link'}{' '}
                        ›
                      </span>
                    )}
                  </button>

                  {mode !== 'forgot' && (
                    <p className="text-[11px] text-zinc-500 text-center leading-relaxed pt-2">
                      By continuing, you agree to Fibez&apos;s{' '}
                      <Link href="/terms" className="text-zinc-300 underline hover:text-white">
                        Terms of Service
                      </Link>{' '}
                      and acknowledge our{' '}
                      <Link href="/privacy" className="text-zinc-300 underline hover:text-white">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  )}
                </form>
              </>
            )}

            {/* Mode Switcher */}
            <div className="mt-6 pt-4 border-t border-[#1a1b21] text-center text-xs text-[#a1a4a5]">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-white hover:underline font-mono ml-1 font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-white hover:underline font-mono ml-1 font-semibold cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>

            {/* Direct Admin & Dev Quick Access */}
            <div className="mt-4 pt-4 border-t border-[#1a1b21]/70 space-y-2.5">
              <button
                type="button"
                onClick={() => handleDevQuickSignIn('akain@fibez.store')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#3ad389]/10 hover:bg-[#3ad389]/20 border border-[#3ad389]/30 text-[#3ad389] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1-Click Owner Sign In (Akain)</span>
              </button>

              <div className="text-center">
                <Link
                  href="/admin"
                  className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Direct Master Admin Console →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-zinc-500 font-mono text-xs">
          Loading login console...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
