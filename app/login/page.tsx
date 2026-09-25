'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Guard against rapid multi-clicks

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ username, password });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username or password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('emilys');
    setPassword('emilyspass');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage products & catalog inventory</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Inline Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm flex items-start gap-3 animate-fadeIn">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="font-semibold block text-red-200">Authentication Failed</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Helper Chip for Quick Demo */}
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DummyJSON Demo Credentials</span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-medium transition-colors"
            >
              Fill Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. emilys"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all disabled:opacity-50"
                required
              />
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Powered by Next.js 16 &amp; DummyJSON API
        </p>
      </div>
    </div>
  );
}
