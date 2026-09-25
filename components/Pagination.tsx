'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  disabled = false,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * limit + 1, totalItems);
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate numbered page buttons (e.g. max 5 visible around current page)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        end = Math.min(totalPages, 4);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(1, totalPages - 3);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-300">
      {/* Items info & Page size selector */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <strong className="text-white font-semibold">{startItem}</strong>–
          <strong className="text-white font-semibold">{endItem}</strong> of{' '}
          <strong className="text-white font-semibold">{totalItems}</strong> items
        </span>

        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <label htmlFor="limit-select" className="text-slate-400">
            Per page:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={disabled}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'number' ? (
                <button
                  onClick={() => onPageChange(page)}
                  disabled={disabled}
                  className={`w-8 h-8 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  } disabled:opacity-50`}
                >
                  {page}
                </button>
              ) : (
                <span className="px-1 text-slate-500 select-none">...</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
