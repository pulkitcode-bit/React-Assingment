// Types for Product Admin Dashboard

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: ProductMeta;
  images: string[];
  thumbnail: string;
  isLocal?: boolean; // Flag to indicate client-side persisted additions/edits
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PaginationParams {
  limit: number;
  skip: number;
}

export interface FetchProductsParams {
  limit: number;
  skip: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  signal?: AbortSignal;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
