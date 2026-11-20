'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BackgroundBeams } from '@/components/ui/background-beams';
import FibezLogo from '@/components/FibezLogo';
import { authClient, extractAuthErrorMessage } from '@/lib/auth-client';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

function BottomGradient() {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#3ad389] to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    </>
  );
}

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className || ''}`}>
      {children}
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/vault';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please provide a valid email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || email.split('@')[0];

      const { error: signUpError } = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: fullName,
      });

      if (signUpError) {
        throw new Error(
          extractAuthErrorMessage(
            signUpError,
            'Failed to create account. Email may already be registered.'
          )
        );
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(callbackUrl);
      }, 700);
    } catch (err: unknown) {
      setError(extractAuthErrorMessage(err, 'Failed to create account. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fibez.store';
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${origin}${callbackUrl}`,
        errorCallbackURL: `${origin}/login?error=oauth`,
      });
      if (result?.error) {
        setError(
          extractAuthErrorMessage(result.error, 'Google sign-up failed. Please use email and password.')
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(extractAuthErrorMessage(err, 'Google authentication encountered an error.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-[#3ad389] selection:text-black overflow-hidden py-12 md:py-20">
      {/* Background illumination */}
      <BackgroundBeams className="opacity-50" />

      {/* Top Logo */}
      <div className="relative z-10 mb-6 flex flex-col items-center">
        <FibezLogo />
        <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase mt-2">
          Secure Storefront Account
        </span>
      </div>

      {/* Signup Form Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#09090c]/90 border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
        <h2 className="text-xl font-bold text-white">
          Create your Fibez Account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Unlock instant digital key deliveries, personal key vault, and unthrottled V2Ray lines.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account created successfully! Redirecting...</span>
          </div>
        )}

        <form className="my-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-3">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                placeholder="Tyler"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                placeholder="Durden"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="you@domain.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </LabelInputContainer>

          {/* Terms & Conditions Acceptance Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#3ad389] focus:ring-[#3ad389] accent-[#3ad389] cursor-pointer"
              />
              <span className="text-xs text-zinc-400 leading-snug">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-zinc-200 underline hover:text-white">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="text-zinc-200 underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            className="group/btn relative block h-10 w-full rounded-xl bg-gradient-to-br from-white to-zinc-200 font-medium text-black shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 transition-all font-mono text-xs cursor-pointer mt-6"
            type="submit"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign up &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
            <BottomGradient />
          </button>

          <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

          {/* Social Sign Up */}
          <div className="flex flex-col space-y-2">
            <button
              className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-xl border border-white/10 bg-[#121215] px-4 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <BottomGradient />
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-500 font-mono">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-200 hover:text-white underline transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RegisterForm />
    </Suspense>
  );
}
