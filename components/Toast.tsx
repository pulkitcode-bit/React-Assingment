'use client';

import React from 'react';
import { useProductContext } from '@/context/ProductContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useProductContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-slideUp ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/20'
              : 'bg-slate-900/95 border-indigo-500/50 text-indigo-300 shadow-indigo-950/20'
          }`}
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && (
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight">{toast.title}</h4>
            <p className="text-xs mt-1 text-slate-300 leading-snug">{toast.message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
