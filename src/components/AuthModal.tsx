'use client';

import React, { useState } from 'react';
import { X, Check, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
}: {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: typeof window !== 'undefined' ? window.location.href : '/',
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in encounterd an error');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await authClient.signIn.email({
          email,
          password,
        });

        if (authError) {
          setError(authError.message || 'Invalid email or password.');
          setIsLoading(false);
          return;
        }
      } else {
        const { data, error: authError } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split('@')[0],
        });

        if (authError) {
          setError(authError.message || 'Unable to create account. Check your details.');
          setIsLoading(false);
          return;
        }
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px] animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-black border border-[#292d30] rounded-[16px] shadow-2xl overflow-hidden p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-[6px] text-[#a1a4a5] hover:text-white hover:bg-[#1a1c1e] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            Fibez Console Access
          </div>
          <h3 className="text-2xl font-normal tracking-[-0.03em] text-white">
            {mode === 'login' ? 'Log in to your vault' : 'Create developer account'}
          </h3>
          <p className="text-sm text-[#a1a4a5] mt-1">
            {mode === 'login'
              ? 'Access active subscriptions, API credentials, and license keys.'
              : 'Deploy digital infrastructure and claim zero-trust keys.'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-3 rounded-[8px] bg-[#1d0e11] border border-[#ff453a]/40 text-xs text-[#ff8077] font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ff453a] mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-[#a1a4a5] hover:text-white shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Google OAuth (No Discord) */}
        <div className="mb-6">
          <button
            type="button"
            disabled={isLoading || isSubmitted}
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[6px] border border-[#292d30] hover:border-white bg-[#050505] text-sm text-[#f0f0f0] font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="flex-grow border-t border-[#292d30]" />
          <span className="flex-shrink mx-3 text-xs font-mono text-[#6e727a] uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-[#292d30]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-mono text-xs text-[#a1a4a5] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#050505] border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-xs text-[#a1a4a5] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@fibez.io"
              className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#050505] border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#a1a4a5] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#050505] border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitted}
            className="w-full btn-action-resend !py-2.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitted ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black" />
                <span>Authenticated</span>
              </span>
            ) : isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Connecting...</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'} ›</span>
            )}
          </button>

          {/* Terms of Service & Privacy Agreement Notice */}
          <p className="text-[11px] text-zinc-500 text-center leading-relaxed mt-3">
            By signing in or creating an account, you agree to Fibez&apos;s{' '}
            <a href="/terms" target="_blank" className="text-zinc-300 underline hover:text-white">
              Terms of Service
            </a>{' '}
            and acknowledge our{' '}
            <a href="/privacy" target="_blank" className="text-zinc-300 underline hover:text-white">
              Privacy Policy
            </a>.
          </p>
        </form>

        {/* Quick Test Role Logins */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 text-center">
            Demo Logins (3 Roles)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('user@fibez.io');
                setPassword('Password123!');
                setMode('login');
              }}
              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer text-center"
            >
              User
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@fibez.io');
                setPassword('Password123!');
                setMode('login');
              }}
              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('owner@fibez.io');
                setPassword('Password123!');
                setMode('login');
              }}
              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer text-center"
            >
              Owner
            </button>
          </div>
        </div>

        {/* Footer switch */}
        <div className="mt-6 pt-4 border-t border-[#1f2224] text-center text-xs text-[#a1a4a5]">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="text-white hover:underline font-mono ml-1"
              >
                Sign up
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
                className="text-white hover:underline font-mono ml-1"
              >
                Log in
              </button>
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
