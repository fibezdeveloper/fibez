'use client';

import React, { useState } from 'react';
import { X, Check, Mail, Lock, User, ArrowRight } from 'lucide-react';

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
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px] animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-black border border-[#292d30] rounded-[16px] shadow-2xl overflow-hidden p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-[6px] text-[#a1a4a5] hover:text-white hover:bg-[#1a1c1e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
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

        {/* OAuth Buttons */}
        <div className="space-y-2 mb-6">
          {/* Google */}
          <button
            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[6px] border border-[#292d30] hover:border-white bg-[#050505] text-sm text-[#f0f0f0] font-mono transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Discord */}
          <button
            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[6px] border border-[#292d30] hover:border-[#5865F2] bg-[#050505] text-sm text-[#f0f0f0] font-mono transition-colors"
          >
            <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
            </svg>
            <span>Continue with Discord</span>
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
              placeholder="developer@terminal.sh"
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
            disabled={isSubmitted}
            className="w-full btn-action-resend !py-2.5 mt-2"
          >
            {isSubmitted ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black" />
                <span>Authenticated</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'} ›</span>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 pt-4 border-t border-[#1f2224] text-center text-xs text-[#a1a4a5]">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-white hover:underline font-mono"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-white hover:underline font-mono"
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
