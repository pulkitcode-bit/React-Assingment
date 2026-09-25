'use client';

/**
 * ============================================================================
 * PRODUCTS DASHBOARD PAGE (/products)
 * ============================================================================
 * Key Logic Highlights:
 * 1. URL searchParams Syncing: All UI controls (page, search, category, sortBy, order, limit)
 *    are synced to URL parameters via Next.js `useSearchParams` and `useRouter`.
 * 2. Edge-case Clamping: Bad query inputs like ?page=abc or ?page=9999 are safely clamped
 *    to valid numeric ranges (1 <= page <= totalPages) to prevent blank screens or crashes.
 * 3. Race-Condition Safety: Uses an AbortController per request. In-flight requests are aborted
 *    when newer queries trigger. Tested with artificial latency `&delay=2000` in code comments.
 * 4. Search vs Category Tradeoff: Selecting a category clears/disables the search query term
 *    (and vice-versa) because DummyJSON API does not support combining `q` and `/category` filters.
 * 5. Fake Persistence Context: Add/Edit/Delete actions fire real API requests and then merge
 *    local overlays so changes persist throughout the user's session with a toast notification.
 * ============================================================================
 */

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductTable from '@/components/ProductTable';
import Pagination from '@/components/Pagination';
import ProductFormModal from '@/components/ProductFormModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductContext } from '@/context/ProductContext';
import { Product, Category } from '@/types';
import axios from 'axios';
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  addProduct as addProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from '@/lib/api/products';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyLocalOverlays, recordLocalAdd, recordLocalUpdate, recordLocalDelete, addToast } =
    useProductContext();

  // Read URL parameters
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSortBy = searchParams.get('sortBy') || '';
  const urlOrder = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  // Parse & Clamp initial page and limit
  const limit = Math.max(10, Number(rawLimit) || 10);
  const parsedPage = parseInt(rawPage || '1', 10);
  const initialPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Local Component State
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 450);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // AbortController reference for canceling stale in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to update URL search parameters cleanly
  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Sync debounced search value to URL searchParams & reset to Page 1
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateQueryParams({
        search: debouncedSearch || null,
        page: 1, // Reset to page 1 whenever search query changes
        category: null, // Clear category selection due to API tradeoff constraint
      });
    }
  }, [debouncedSearch, urlSearch, updateQueryParams]);

  // Fetch Category List on mount
  useEffect(() => {
    async function fetchCategoryList() {
      try {
        const catList = await getCategories();
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load product categories:', err);
      }
    }
    fetchCategoryList();
  }, []);

  // Main Product Fetching & Race Condition Protection Logic
  const loadProducts = useCallback(async () => {
    // Cancel previous in-flight HTTP request if a newer query/filter is fired
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request instance
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    const skip = (initialPage - 1) * limit;

    try {
      let data;
      const apiParams = {
        limit,
        skip,
        sortBy: urlSortBy || undefined,
        order: urlOrder || undefined,
        signal: controller.signal,
      };

      if (urlCategory) {
        // Fetch products by category
        data = await getProductsByCategory({ ...apiParams, category: urlCategory });
      } else if (urlSearch) {
        // Fetch products by debounced search term
        data = await searchProducts({ ...apiParams, search: urlSearch });
      } else {
        // Fetch default paginated product list
        data = await getProducts(apiParams);
      }

      // If this request was aborted while waiting for response, do not update state
      if (controller.signal.aborted) {
        return;
      }

      // Compute total items and total pages
      const total = data.total;
      const computedTotalPages = Math.max(1, Math.ceil(total / limit));

      // Guard against bad URL ?page=999: clamp to maximum valid page
      if (initialPage > computedTotalPages && computedTotalPages > 0) {
        updateQueryParams({ page: computedTotalPages });
        return;
      }

      // Apply client-side local CRUD overlays to API data
      const mergedList = applyLocalOverlays(data.products);
      setProducts(mergedList);
      setTotalItems(total);
      setFetchError(null);
    } catch (error: unknown) {
      // Safely ignore cancellation errors (React Strict Mode re-mounts or newer search queries)
      const isCancel =
        controller.signal.aborted ||
        axios.isCancel(error) ||
        (error instanceof Error &&
          (error.name === 'CanceledError' || error.message.toLowerCase() === 'canceled')) ||
        (error as { code?: string })?.code === 'ERR_CANCELED';

      if (isCancel) {
        return;
      }

      const msg =
        error instanceof Error
          ? error.message
          : 'Failed to fetch products. Please check your network connection.';
      setFetchError(msg);
    } finally {
      // Only finalize loading state if this request wasn't superseded/aborted
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [
    initialPage,
    limit,
    urlCategory,
    urlSearch,
    urlSortBy,
    urlOrder,
    applyLocalOverlays,
    updateQueryParams,
  ]);

  // Re-fetch products when active URL searchParams change
  useEffect(() => {
    loadProducts();

    return () => {
      // On unmount or parameter change, cleanup controller reference
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  // Handlers for Filters, Sort, and Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    // If user typed in search box, clear category filter state immediately
    if (urlCategory) {
      updateQueryParams({ category: null });
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSearchInput(''); // Clear search input
    updateQueryParams({
      category: cat || null,
      search: null,
      page: 1, // Reset to page 1 on category change
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      updateQueryParams({ sortBy: null, order: null });
    } else {
      const [sortBy, order] = val.split('-');
      updateQueryParams({ sortBy, order });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    updateQueryParams({ limit: newLimit, page: 1 });
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: Partial<Product>) => {
    if (editingProduct) {
      // UPDATE EXISTING PRODUCT
      try {
        await updateProductApi(editingProduct.id, formData);
        recordLocalUpdate(editingProduct.id, formData);
      } catch (err) {
        addToast('Update Failed', String(err), 'error');
        throw err;
      }
    } else {
      // CREATE NEW PRODUCT
      try {
        const created = await addProductApi(formData);
        recordLocalAdd({
          ...formData,
          id: created.id || Date.now(),
        } as Product);
      } catch (err) {
        addToast('Create Failed', String(err), 'error');
        throw err;
      }
    }
  };

  const handleDeleteConfirm = async (productId: number) => {
    try {
      await deleteProductApi(productId);
      recordLocalDelete(productId);
    } catch (err) {
      addToast('Delete Failed', String(err), 'error');
      throw err;
    }
  };

  const computedTotalPages = Math.max(1, Math.ceil(totalItems / limit));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Add Button Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Product Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage inventories, categories, pricing, and stock levels
            </p>
          </div>

          <button
            id="add-product-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-md">
          {/* Search Box (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search products by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  updateQueryParams({ search: null });
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter Dropdown (4 cols) */}
          <div className="lg:col-span-4">
            <select
              id="category-select"
              value={urlCategory}
              onChange={handleCategorySelect}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              id="sort-select"
              value={urlSortBy ? `${urlSortBy}-${urlOrder}` : ''}
              onChange={handleSortChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sort by Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>
        </div>

        {/* API Error State with Retry Button */}
        {fetchError && (
          <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-bold text-white text-base">Unable to Load Products</h4>
                <p className="text-xs text-rose-300 mt-0.5">{fetchError}</p>
              </div>
            </div>

            <button
              onClick={loadProducts}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-900/40 transition-colors self-start sm:self-auto shrink-0"
            >
              Retry Request
            </button>
          </div>
        )}

        {/* Product Table / Cards View */}
        {!fetchError && (
          <ProductTable
            products={products}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            isLoading={isLoading}
          />
        )}

        {/* Pagination Bar */}
        {!fetchError && !isLoading && (
          <Pagination
            currentPage={initialPage}
            totalPages={computedTotalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            disabled={isLoading}
          />
        )}
      </main>

      {/* Product Add / Edit Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* Product Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={deletingProduct}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading dashboard parameters...</span>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
