'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard/vault');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="card-sharp max-w-md w-full p-8 sm:p-10 bg-[var(--color-onyx)] border border-[var(--color-graphite)] shadow-[0_0_24px_rgba(0,0,0,0.8)] space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-[4px] overflow-hidden bg-[var(--color-carbon)] border border-[var(--color-graphite)] flex items-center justify-center mb-3">
            <Image
              src="/brand/fibez-logo-dark.png"
              alt="Fibez Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>

          <span className="metadata-stamp text-[10px]">
            [ IDENTITY ACCESS // NEW RECIPIENT REGISTRATION ]
          </span>

          <h1 className="font-serif text-3xl font-normal text-white">
            Register for Vault
          </h1>

          <p className="text-xs font-mono text-[var(--color-smoke)]">
            Create your account for instant license key dispatch, backup recovery, and receipt tracking.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => router.push('/dashboard/vault')}
            className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-medium rounded-[2px] flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
            </svg>
            <span>SIGN UP WITH DISCORD</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/vault')}
            className="w-full py-2.5 px-4 bg-[var(--color-carbon)] hover:bg-[var(--color-graphite)] border border-[var(--color-slate)] text-white font-mono text-xs font-medium rounded-[2px] flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>SIGN UP WITH GOOGLE</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--color-graphite)] w-full" />
          <span className="bg-[var(--color-onyx)] px-3 text-[10px] font-mono text-[var(--color-ash)] uppercase">
            OR REGISTER WITH EMAIL
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-[var(--color-ash)] uppercase mb-1">
              FULL NAME / CALLSIGN
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-[var(--color-ash)] absolute left-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent Smith"
                className="w-full pl-10 pr-3 py-2.5 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white outline-none rounded-[2px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--color-ash)] uppercase mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[var(--color-ash)] absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@fibez.io"
                className="w-full pl-10 pr-3 py-2.5 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white outline-none rounded-[2px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--color-ash)] uppercase mb-1">
              CHOOSE SECURE PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[var(--color-ash)] absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white outline-none rounded-[2px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-signal w-full py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span>REGISTERING IDENTITY...</span>
            ) : (
              <>
                <span>CREATE VAULT ACCOUNT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch */}
        <div className="text-center pt-2 border-t border-[var(--color-graphite)] font-mono text-xs text-[var(--color-smoke)]">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[var(--color-accent)] hover:underline">
            Sign In to Session
          </Link>
        </div>

      </div>
    </div>
  );
}
