'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import FibezLogo from '@/components/FibezLogo';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Loader2, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const callbackUrl = searchParams.get('callbackUrl') || '/vault';

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'register') setMode('register');
    else if (qMode === 'login') setMode('login');
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: typeof window !== 'undefined' ? `${window.location.origin}${callbackUrl}` : callbackUrl,
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in encountered an error.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error: authError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (authError) {
          setError(authError.message || 'Invalid email or password. Please verify your credentials.');
          setIsLoading(false);
          return;
        }
      } else {
        const { error: authError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split('@')[0],
        });

        if (authError) {
          setError(authError.message || 'Unable to create account. Please check your details.');
          setIsLoading(false);
          return;
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(callbackUrl);
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-24">
      
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-md flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
        <span className="text-zinc-300">
          {mode === 'login' ? 'Sign In' : 'Register'}
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
                {session.user.email} • Role: <span className="uppercase text-zinc-300 font-semibold">{(session.user as any).role || 'user'}</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/vault"
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Access Key Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Console Dashboard</span>
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
                {mode === 'login' ? 'Log in to your vault' : 'Create developer account'}
              </h1>
              <p className="text-xs text-[#a1a4a5] mt-2 leading-relaxed">
                {mode === 'login'
                  ? 'Access encrypted credentials, active subscriptions, and license keys.'
                  : 'Instant automated provisioning for zero-trust digital goods.'}
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
                  className="text-zinc-500 hover:text-white shrink-0 ml-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Google Social Authentication */}
            <div className="mb-6">
              <button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs text-[#f0f0f0] font-mono transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"/>
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

            {/* Email & Password Form */}
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
                      placeholder="Ada Lovelace"
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
                    placeholder="developer@fibez.io"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                  />
                  <Mail className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#050507] border border-[#22252b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono transition-colors"
                  />
                  <Lock className="w-4 h-4 text-zinc-600 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

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
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <span>{mode === 'login' ? 'Sign In to Console' : 'Create Account'} ›</span>
                )}
              </button>

              {/* Terms & Privacy Policy Notice */}
              <p className="text-[11px] text-zinc-500 text-center leading-relaxed pt-2">
                By continuing, you agree to Fibez&apos;s{' '}
                <Link href="/terms" className="text-zinc-300 underline hover:text-white">
                  Terms of Service
                </Link>{' '}
                and acknowledge our{' '}
                <Link href="/privacy" className="text-zinc-300 underline hover:text-white">
                  Privacy Policy
                </Link>.
              </p>
            </form>

            {/* Mode Switcher */}
            <div className="mt-6 pt-4 border-t border-[#1a1b21] text-center text-xs text-[#a1a4a5]">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('register');
                    }}
                    className="text-white hover:underline font-mono ml-1 font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('login');
                    }}
                    className="text-white hover:underline font-mono ml-1 font-semibold cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-zinc-500 font-mono text-xs">Loading login console...</div>}>
      <LoginContent />
    </Suspense>
  );
}
