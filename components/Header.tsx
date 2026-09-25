'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Title */}
        <Link href="/products" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              ProductAdmin
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/20 font-medium">
              v1.0
            </span>
          </div>
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 pr-2 sm:border-r sm:border-slate-800">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.firstName || user.username}
                  className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center justify-center text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-white leading-tight">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                </div>
                <div className="text-xs text-slate-400 font-mono">@{user.username}</div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            id="logout-button"
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800/80 transition-all cursor-pointer"
            title="Sign out of account"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
