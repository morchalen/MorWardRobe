export type CategoryType = '上衣' | '裤子' | '裙子' | '外套' | '连衣裙' | '鞋靴' | '配饰' | '其他';

export type SeasonType = string;

export interface Clothing {
  id: string;
  user_id?: string;
  name: string;
  image_url: string;
  thumbnail_url: string;
  category: CategoryType;
  color: string;
  seasons: SeasonType[];
  wardrobe_type?: 'thin' | 'thick';
  last_worn_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  avatar_url: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user: User;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface ApiError {
  code: number;
  error: string;
  message: string;
  request_id?: string;
}

export interface WardrobeStats {
  total: number;
}

export interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  icon: string;
}
