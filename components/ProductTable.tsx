'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading?: boolean;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  isLoading = false,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Desktop Skeleton */}
        <div className="hidden md:block bg-slate-900/60 rounded-2xl border border-slate-800 p-4 overflow-hidden">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-800/50 rounded-xl w-full" />
            ))}
          </div>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="grid md:hidden grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-900/60 rounded-2xl border border-slate-800 p-4 h-44" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">No products found</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Try adjusting your search query, changing category filters, or adding a new product.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* DESKTOP TABLE VIEW (md:block) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-4 px-6">Product</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Price</th>
              <th className="py-4 px-4">Rating</th>
              <th className="py-4 px-4">Stock</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/40 transition-colors group">
                {/* Image & Title */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      <img
                        src={product.thumbnail || product.images?.[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-white hover:text-indigo-400 transition-colors truncate block max-w-xs"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        {product.isLocal && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            LOCAL
                          </span>
                        )}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-slate-500 truncate">{product.brand}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700 font-medium">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 font-bold text-white text-base">
                  ${product.price?.toFixed(2)}
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{product.rating ?? 'N/A'}</span>
                  </div>
                </td>

                {/* Stock */}
                <td className="py-3.5 px-4">
                  {product.stock > 10 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      In Stock ({product.stock})
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Low Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Out of Stock
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 transition-colors"
                      title="Edit Product"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 transition-colors"
                      title="Delete Product"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW (md:hidden) */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-bold text-white text-base hover:text-indigo-400 transition-colors truncate block"
                  >
                    {product.title}
                  </Link>
                  {product.isLocal && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LOCAL
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 font-medium">
                    {product.category}
                  </span>
                  <span className="text-xs text-slate-400">★ {product.rating ?? 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Price</div>
                <div className="text-lg font-extrabold text-white">${product.price?.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  View
                </Link>

                <button
                  onClick={() => onEdit(product)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/50"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(product)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-xs font-semibold text-rose-300 hover:bg-rose-900/60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
