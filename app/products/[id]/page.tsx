'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Product } from '@/types';
import { getProductById } from '@/lib/api/products';
import { useProductContext } from '@/context/ProductContext';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { addedProducts, updatedProducts, deletedProductIds } = useProductContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setNotFound(false);

      const numId = Number(productId);

      // Check if product was locally deleted
      if (!isNaN(numId) && deletedProductIds.includes(numId)) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Check if product exists in locally added items
      const localAdd = addedProducts.find((p) => p.id.toString() === productId);
      if (localAdd) {
        setProduct(localAdd);
        setSelectedImage(localAdd.images?.[0] || localAdd.thumbnail || '');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProductById(productId);

        // Merge local updates if applicable
        const finalProduct = updatedProducts[data.id]
          ? { ...data, ...updatedProducts[data.id] }
          : data;

        setProduct(finalProduct);
        setSelectedImage(finalProduct.thumbnail || finalProduct.images?.[0] || '');
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId, addedProducts, updatedProducts, deletedProductIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-800 rounded-xl w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-slate-800 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
                <div className="h-6 bg-slate-800 rounded-xl w-1/4" />
                <div className="h-24 bg-slate-800 rounded-xl w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Proper 404 / Invalid ID fallback UI
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Product Not Found</h1>
          <p className="mt-2 text-slate-400 max-w-md">
            The product you are looking for (ID: <code className="text-amber-300 font-mono">{productId}</code>) does not exist or has been deleted.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  const allImages = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <Link href="/products" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-500 capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{product.title}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Image Gallery Column */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="w-full aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              <img
                src={selectedImage || product.thumbnail}
                alt={product.title}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Thumbnail Carousel / Grid */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border shrink-0 overflow-hidden transition-all ${
                      selectedImage === img
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Info Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Stock Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs">
                    Brand: {product.brand}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-semibold text-xs">
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 font-semibold text-xs">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Rating & Review Summary */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <span>★</span>
                  <span>{product.rating ?? 'N/A'}</span>
                </div>
                {product.reviews && (
                  <span className="text-xs text-slate-400">
                    ({product.reviews.length} verified reviews)
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white">${product.price?.toFixed(2)}</span>
                {product.discountPercentage && (
                  <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  {product.description || 'No detailed description provided for this product.'}
                </p>
              </div>
            </div>

            {/* Additional Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              {product.sku && (
                <div>
                  <span className="block text-slate-500 font-mono uppercase">SKU</span>
                  <span className="text-slate-200 font-medium">{product.sku}</span>
                </div>
              )}
              {product.warrantyInformation && (
                <div>
                  <span className="block text-slate-500 uppercase">Warranty</span>
                  <span className="text-slate-200 font-medium">{product.warrantyInformation}</span>
                </div>
              )}
              {product.shippingInformation && (
                <div>
                  <span className="block text-slate-500 uppercase">Shipping</span>
                  <span className="text-slate-200 font-medium">{product.shippingInformation}</span>
                </div>
              )}
              {product.returnPolicy && (
                <div>
                  <span className="block text-slate-500 uppercase">Return Policy</span>
                  <span className="text-slate-200 font-medium">{product.returnPolicy}</span>
                </div>
              )}
            </div>

            {/* Back to Products */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((rev, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{rev.reviewerName}</span>
                    <span className="text-amber-400 text-xs font-bold">★ {rev.rating}/5</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">&quot;{rev.comment}&quot;</p>
                  <div className="text-[11px] text-slate-500">
                    {new Date(rev.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
