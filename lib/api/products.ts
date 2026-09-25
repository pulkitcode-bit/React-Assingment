import api from '../axios';
import { Product, ProductsResponse, FetchProductsParams, Category } from '@/types';

/**
 * ============================================================================
 * RACE-CONDITION HANDLING & DELAY TESTING COMMENT
 * ============================================================================
 * When users type rapidly in the search input or switch categories quickly, multiple
 * HTTP requests can be fired asynchronously. If a slower earlier request resolves AFTER
 * a faster newer request, the UI would overwrite current data with stale data.
 * 
 * Safety Implementation:
 * We pass an `AbortSignal` (from an `AbortController`) in the Axios `config.signal`
 * for every fetch request (`getProducts`, `searchProducts`, `getProductsByCategory`).
 * When a new query is initiated, the previous request's AbortController is aborted,
 * instantly canceling the in-flight network request.
 * 
 * Manual Race-Condition Verification:
 * This was manually tested against DummyJSON's artificial latency parameter by appending
 * `&delay=2000` to the API URLs (e.g., `/products/search?q=phone&delay=2000`).
 * Rapid typing with delay enabled correctly cancels intermediate requests and only renders
 * the response from the latest requested query term.
 * ============================================================================
 */

/**
 * ============================================================================
 * SEARCH VS CATEGORY TRADEOFF COMMENT
 * ============================================================================
 * Tradeoff Choice: DummyJSON API endpoints do not support simultaneous searching (`q=`)
 * and category filtering (`/category/{category}`).
 * 
 * Implementation Strategy:
 * When a category is selected by the user, we clear/disable the search box.
 * Vice-versa, when the user types a search query, we clear/reset the category filter.
 * This guarantees predictable single-filter state and prevents invalid hybrid queries.
 * ============================================================================
 */

/**
 * Fetch paginated products list with optional sorting.
 */
export async function getProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const { limit, skip, sortBy, order, signal } = params;
  let url = `/products?limit=${limit}&skip=${skip}`;
  
  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}`;
  }
  if (order) {
    url += `&order=${order}`;
  }

  const response = await api.get<ProductsResponse>(url, { signal });
  return response.data;
}

/**
 * Search products by query term `q` with pagination & sorting.
 * Accepts `signal` for AbortController request cancellation.
 */
export async function searchProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const { search, limit, skip, sortBy, order, signal } = params;
  const q = search ? encodeURIComponent(search) : '';
  let url = `/products/search?q=${q}&limit=${limit}&skip=${skip}`;

  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}`;
  }
  if (order) {
    url += `&order=${order}`;
  }

  const response = await api.get<ProductsResponse>(url, { signal });
  return response.data;
}

/**
 * Fetch all available product categories list.
 */
export async function getCategories(): Promise<Category[]> {
  // DummyJSON provides /products/categories (list of objects or strings) or /products/category-list
  try {
    const response = await api.get<Category[] | string[]>('/products/categories');
    if (Array.isArray(response.data)) {
      if (typeof response.data[0] === 'string') {
        return (response.data as string[]).map((cat) => ({
          slug: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
          url: `/products/category/${cat}`,
        }));
      }
      return response.data as Category[];
    }
    return [];
  } catch {
    // Fallback to category-list endpoint if /categories differs
    const response = await api.get<string[]>('/products/category-list');
    return response.data.map((cat) => ({
      slug: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
      url: `/products/category/${cat}`,
    }));
  }
}

/**
 * Fetch products within a specific category with pagination & sorting.
 */
export async function getProductsByCategory(params: FetchProductsParams): Promise<ProductsResponse> {
  const { category, limit, skip, sortBy, order, signal } = params;
  const cat = category ? encodeURIComponent(category) : '';
  let url = `/products/category/${cat}?limit=${limit}&skip=${skip}`;

  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}`;
  }
  if (order) {
    url += `&order=${order}`;
  }

  const response = await api.get<ProductsResponse>(url, { signal });
  return response.data;
}

/**
 * Fetch product details by ID.
 */
export async function getProductById(id: number | string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

/**
 * Add a new product (POST /products/add).
 */
export async function addProduct(productData: Partial<Product>): Promise<Product> {
  const response = await api.post<Product>('/products/add', productData);
  return response.data;
}

/**
 * Update an existing product (PUT /products/{id}).
 */
export async function updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, productData);
  return response.data;
}

/**
 * Delete a product (DELETE /products/{id}).
 */
export async function deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
  const response = await api.delete<{ id: number; isDeleted: boolean }>(`/products/${id}`);
  return response.data;
}
