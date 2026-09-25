'use client';

/**
 * ============================================================================
 * FAKE PERSISTENCE CONTEXT PATTERN
 * ============================================================================
 * Explanation:
 * DummyJSON is a mock REST API that simulates POST /products/add, PUT /products/{id},
 * and DELETE /products/{id}. However, DummyJSON DOES NOT actually persist mutations
 * on their backend database. Subsequent GET requests revert to initial default data.
 * 
 * Local State Overlay Solution:
 * To provide a realistic Admin Dashboard experience during user testing, this
 * `ProductContext` maintains local client-side state overlays:
 * 1. `addedProducts`: Prepended locally added products.
 * 2. `updatedProducts`: Map of modified product fields by ID.
 * 3. `deletedProductIds`: Set of deleted product IDs.
 * 
 * Whenever a user performs an Add, Edit, or Delete action, the API request executes
 * successfully, and we immediately update our local React context overlays. We also
 * dispatch a Toast notification: "Change saved locally — DummyJSON does not persist writes."
 * ============================================================================
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, ToastMessage } from '@/types';

interface ProductContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  recordLocalAdd: (product: Product) => void;
  recordLocalUpdate: (id: number, updatedFields: Partial<Product>) => void;
  recordLocalDelete: (id: number) => void;
  applyLocalOverlays: (products: Product[]) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      // Auto-dismiss toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const recordLocalAdd = (product: Product) => {
    const newProduct: Product = {
      ...product,
      isLocal: true,
      images: product.images?.length ? product.images : [product.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg'],
      thumbnail: product.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
    };
    setAddedProducts((prev) => [newProduct, ...prev]);
    addToast(
      'Product Created',
      'Change saved locally — DummyJSON does not persist writes.',
      'success'
    );
  };

  const recordLocalUpdate = (id: number, updatedFields: Partial<Product>) => {
    setUpdatedProducts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updatedFields, isLocal: true },
    }));
    
    // Also update in addedProducts if it was a locally added item
    setAddedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    addToast(
      'Product Updated',
      'Change saved locally — DummyJSON does not persist writes.',
      'info'
    );
  };

  const recordLocalDelete = (id: number) => {
    setDeletedProductIds((prev) => [...prev, id]);
    setAddedProducts((prev) => prev.filter((p) => p.id !== id));
    
    addToast(
      'Product Deleted',
      'Change saved locally — DummyJSON does not persist writes.',
      'error'
    );
  };

  /**
   * Applies client-side overlays to API product list:
   * 1. Filters out deleted products.
   * 2. Merges updated fields.
   * 3. Prepends newly added local products (if not already included).
   */
  const applyLocalOverlays = useCallback(
    (fetchedProducts: Product[]): Product[] => {
      // 1. Filter out deleted products
      let result = fetchedProducts.filter((p) => !deletedProductIds.includes(p.id));

      // 2. Merge local updates into fetched list
      result = result.map((p) => {
        if (updatedProducts[p.id]) {
          return { ...p, ...updatedProducts[p.id] };
        }
        return p;
      });

      // 3. Prepend newly added local products that are not present in fetched result
      const fetchedIds = new Set(result.map((p) => p.id));
      const localAddsToPrepend = addedProducts.filter(
        (p) => !fetchedIds.has(p.id) && !deletedProductIds.includes(p.id)
      );

      return [...localAddsToPrepend, ...result];
    },
    [addedProducts, updatedProducts, deletedProductIds]
  );

  return (
    <ProductContext.Provider
      value={{
        addedProducts,
        updatedProducts,
        deletedProductIds,
        toasts,
        addToast,
        removeToast,
        recordLocalAdd,
        recordLocalUpdate,
        recordLocalDelete,
        applyLocalOverlays,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
