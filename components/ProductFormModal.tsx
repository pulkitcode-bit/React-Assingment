'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  categories: Category[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}: ProductFormModalProps) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setPrice(initialData.price?.toString() || '');
      setStock(initialData.stock?.toString() || '');
      setBrand(initialData.brand || '');
      setThumbnail(initialData.thumbnail || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.slug || 'smartphones');
      setPrice('');
      setStock('10');
      setBrand('');
      setThumbnail('');
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!category.trim()) {
      newErrors.category = 'Category is required.';
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a number greater than 0.';
    }
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative integer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Guard against rapid multi-clicks

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        brand: brand || undefined,
        thumbnail: thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
        images: thumbnail ? [thumbnail] : ['https://cdn.dummyjson.com/product-images/1/thumbnail.jpg'],
        rating: initialData?.rating ?? 4.5,
      });
      onClose();
    } catch {
      // Error handling is managed by parent / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isSubmitting}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* Category & Brand Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm capitalize"
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-rose-400">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple / Sony"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.99"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isSubmitting}
              />
              {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Stock Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isSubmitting}
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-400">{errors.stock}</p>}
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Image URL</label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product summary and key specifications..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
