import axios from 'axios';
import type {
  Clothing,
  User,
  AuthResponse,
  PaginatedResponse,
  ApiResponse,
  WardrobeStats
} from '../types';

const API_BASE = '/';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const config = error.config;
    
    const errorInfo = {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[API Error]', errorInfo);
    
    if (error.response?.data) {
      const serverError = error.response.data as { code?: number; message?: string };
      
      const errorMessage = serverError.message || getErrorMessage(error.response.status);
      
      return Promise.reject({
        ...serverError,
        message: errorMessage,
        _isApiError: true,
        _statusCode: error.response.status,
      });
    }
    
    return Promise.reject({
      message: '网络连接失败，请检查网络后重试',
      code: -1,
      _isApiError: true,
      _statusCode: 0,
    });
  }
);

function getErrorMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    400: '请求参数有误，请检查输入内容',
    401: '登录已过期，请重新登录',
    403: '没有权限执行此操作',
    404: '请求的资源不存在',
    409: '数据冲突，请刷新页面后重试',
    422: '数据验证失败，请检查输入格式',
    429: '请求过于频繁，请稍后再试',
    500: '服务器内部错误，请稍后重试',
    502: '服务暂时不可用，请稍后重试',
    503: '系统维护中，请稍后再试',
  };
  
  return statusMessages[status] || `请求失败（状态码：${status}）`;
}

function parsePaginatedResponse<T>(res: any, defaultPage = 1, defaultPerPage = 20): PaginatedResponse<T> {
  const items = Array.isArray(res?.data) ? res.data : [];
  const total = res?.total ?? items.length;
  const page = res?.page ?? defaultPage;
  const perPage = res?.per_page ?? defaultPerPage;
  return {
    items,
    pagination: {
      page,
      per_page: perPage,
      total_items: total,
      total_pages: Math.ceil(total / perPage),
      has_next: page * perPage < total,
      has_prev: page > 1,
    },
  };
}

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', { email, password });
    return (res as unknown as ApiResponse<AuthResponse>).data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return (res as unknown as ApiResponse<AuthResponse>).data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return (res as unknown as ApiResponse<User>).data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
    return (res as unknown as ApiResponse<{ message: string }>).data;
  },

  getBodyImage: async (): Promise<{ body_image_url: string | null }> => {
    const res = await apiClient.get('/auth/body-image');
    return (res as unknown as ApiResponse<{ body_image_url: string | null }>).data;
  },

  updateBodyImage: async (imageFile: File): Promise<{ body_image_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await apiClient.put('/auth/body-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return (res as unknown as ApiResponse<{ body_image_url: string; message: string }>).data;
  },
};

export const adminApi = {
  getDashboard: async (): Promise<any> => {
    const res = await apiClient.get('/admin/dashboard');
    return (res as unknown as ApiResponse<any>).data;
  },

  listUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> => {
    const res = await apiClient.get('/admin/users', { params });
    return parsePaginatedResponse<User>(res, params?.page, params?.per_page);
  },

  createUser: async (data: {
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }): Promise<User> => {
    const res = await apiClient.post('/admin/users', data);
    return (res as unknown as ApiResponse<User>).data;
  },

  updateUser: async (id: string, data: Partial<{
    email?: string;
    password?: string;
    role?: 'user' | 'admin';
    is_active?: boolean;
  }>): Promise<User> => {
    const res = await apiClient.put(`/admin/users/${id}`, data);
    return (res as unknown as ApiResponse<User>).data;
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<void> => {
    await apiClient.put(`/admin/users/${id}/status`, { is_active: isActive });
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  clearUserWardrobe: async (id: string): Promise<{ message: string; deleted_count: number }> => {
    const res = await apiClient.delete(`/admin/users/${id}/wardrobe`);
    return (res as unknown as ApiResponse<{ message: string; deleted_count: number }>).data;
  },

  getUserClothes: async (userId: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Clothing>> => {
    const res = await apiClient.get(`/admin/users/${userId}/clothes`, { params });
    return parsePaginatedResponse<Clothing>(res, params?.page, params?.per_page);
  },

  listAllClothings: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<Clothing>> => {
    const res = await apiClient.get('/admin/clothings', { params });
    return parsePaginatedResponse<Clothing>(res, params?.page, params?.per_page);
  },
};

export const weatherApi = {
  getWeather: async (): Promise<{
    city: string;
    temperature: string;
    description: string;
    date_str: string;
    weekday: string;
  }> => {
    try {
      const res = await apiClient.get('/weather');
      return (res as unknown as ApiResponse<any>).data;
    } catch {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const today = new Date();
      return {
        city: '北京',
        temperature: '26°C',
        description: '多云',
        date_str: today.toLocaleDateString('zh-CN'),
        weekday: weekdays[today.getDay()],
      };
    }
  },
};

export const lobsterApi = {
  chat: async (message: string): Promise<{
    intent: { type: string; name: string; confidence: number };
    extracted_params: Record<string, string>;
    execution_result: { success: boolean; message: string; api_called: string };
    response_template: { phase1: string; phase2: string };
  }> => {
    const res = await apiClient.post('/lobster/chat', { message });
    return (res as unknown as ApiResponse<any>).data;
  },
  recommendOutfit: async (): Promise<{
    upper?: { id: string; name: string; category: string; color: string; image_url: string };
    lower?: { id: string; name: string; category: string; color: string; image_url: string };
    feet?: { id: string; name: string; category: string; color: string; image_url: string };
  }> => {
    const res = await apiClient.get('/lobster/recommend-outfit');
    return (res as unknown as ApiResponse<any>).data;
  },
  rateOutfit: async (data: {
    upper_name: string;
    lower_name: string;
    feet_name: string;
    upper_color: string;
    lower_color: string;
    feet_color: string;
  }): Promise<{
    score: number;
    verdict: string;
    breakdown: {
      color_harmony: number;
      style_coherence: number;
      occasion_fit: number;
      season_fit: number;
    };
    reason: string;
    suggestion: string;
  }> => {
    const res = await apiClient.post('/lobster/rate-outfit', data);
    return (res as unknown as ApiResponse<any>).data;
  },
  getLatestRecommendation: async (): Promise<{
    recommendation: {
      id: string;
      upper_name: string;
      upper_color: string;
      upper_image: string;
      lower_name: string;
      lower_color: string;
      lower_image: string;
      feet_name: string;
      feet_color: string;
      feet_image: string;
      weather_info: string;
      created_at: string;
    } | null;
    rating: {
      id: string;
      score: number;
      verdict: string;
      color_harmony: number;
      style_coherence: number;
      occasion_fit: number;
      season_fit: number;
      reason: string;
      suggestion: string;
      created_at: string;
    } | null;
  }> => {
    try {
      const res = await apiClient.get('/lobster/latest-recommendation');
      return (res as unknown as ApiResponse<any>).data;
    } catch {
      return {
        recommendation: null,
        rating: null,
      };
    }
  },

  formatMarkdown: async (content: string): Promise<{
    formatted_content: string;
  }> => {
    try {
      const res = await apiClient.post('/lobster/chat', {
        message: `请帮我优化这篇Markdown文章的排版和格式。要求：
1. 保持原文内容和语义不变
2. 优化标题层级结构（使用正确的# ## ###层级）
3. 规范列表格式（使用-或数字.）
4. 添加适当的段落分隔（空行）
5. 优化代码块标记（使用三个反引号包裹）
6. 确保Markdown语法规范正确
7. 不要添加任何额外说明文字，直接返回优化后的Markdown内容

以下是需要优化的文章内容：

${content}`
      }, { timeout: 60000 });
      const data = (res as unknown as ApiResponse<any>).data;
      let result = data.response_template?.phase2 || data.response_template?.phase1 || content;
      result = stripCodeBlockWrapper(result);
      return { formatted_content: result };
    } catch (error) {
      console.warn('AI排版服务不可用，使用本地格式化:', error);
      return { formatted_content: formatMarkdownLocally(content) };
    }
  },
};

const stripCodeBlockWrapper = (content: string): string => {
  let result = content;

  const preCodeMatch = result.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
  if (preCodeMatch) {
    result = preCodeMatch[1];
  }

  result = result.replace(/<pre><code[^>]*>/gi, '');
  result = result.replace(/<\/code><\/pre>/gi, '');

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result;
    result = tempDiv.textContent || tempDiv.innerText || result;
  } catch (e) {
    console.warn('HTML解析失败，使用正则清理');
    result = result.replace(/<[^>]+>/g, '');
  }

  return result.trim();
};

const formatMarkdownLocally = (content: string): string => {
  let formatted = content;

  formatted = formatted.replace(/^#{1,6}\s*/gm, (match) => match + '\n');

  formatted = formatted.replace(/^\s*[-*+]\s+/gm, '- ');
  formatted = formatted.replace(/^\s*\d+\.\s+/gm, (match) => {
    return match.replace(/^(\d+)\./, '$1.');
  });

  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  formatted = formatted.replace(/(^|\n)([^#\n>])([^\n]*$)/gm, (_match, p1, p2, p3) => {
    if (p2.match(/^[-*+\d.>\[`]/)) return _match;
    if (p2.trim() === '') return _match;
    return p1 + p2 + p3;
  });

  return formatted.trim();
};

export const clothesApi = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    wardrobe_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<Clothing>> => {
    const res = await apiClient.get('/clothes', { params }) as any;
    return parsePaginatedResponse<Clothing>(res, params?.page, params?.per_page);
  },

  get: async (id: string): Promise<Clothing> => {
    const res = await apiClient.get(`/clothes/${id}`);
    return (res as unknown as ApiResponse<Clothing>).data;
  },

  upload: async (data: {
    images: File;
    category: string;
    color: string;
    name?: string;
    seasons?: string[];
  }, wardrobeType: 'thin' | 'thick' = 'thin'): Promise<{ message: string; clothing_id: number; clothing_name: string; tip: string }> => {
    const formData = new FormData();
    formData.append('images', data.images);
    formData.append('category', data.category);
    formData.append('color', data.color);
    if (data.name) formData.append('name', data.name);
    if (data.seasons) {
      data.seasons.forEach((season) => {
        formData.append('seasons[]', season);
      });
    }

    const res = await apiClient.post(`/clothes/upload?wardrobe_type=${wardrobeType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return (res as unknown as ApiResponse<{ message: string; clothing_id: number; clothing_name: string; tip: string }>).data;
  },

  update: async (id: string, data: Partial<Clothing>): Promise<Clothing> => {
    const res = await apiClient.put(`/clothes/${id}`, data);
    return (res as unknown as ApiResponse<Clothing>).data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/clothes/${id}`);
    return (res as unknown as ApiResponse<{ message: string }>).data;
  },

  stats: async (): Promise<WardrobeStats> => {
    const res = await apiClient.get('/clothes/stats');
    return (res as unknown as ApiResponse<WardrobeStats>).data;
  },
};

const blogApiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

blogApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const config = error.config;
    
    const errorInfo = {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[Blog API Error]', errorInfo);
    
    return Promise.reject({
      message: error.response?.data?.message || '请求失败',
      code: error.response?.status || -1,
      _isApiError: true,
      _statusCode: error.response?.status || 0,
    });
  }
);

export const blogApi = {
  getPosts: async (params?: { page?: number; limit?: number; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.category) query.set('category', params.category);
    return await blogApiClient.get(`/api/blog/posts?${query.toString()}`);
  },

  getPost: async (slug: string) => {
    return await blogApiClient.get(`/api/blog/post/${slug}`);
  },

  createPost: async (data: { title: string; category: string; cover: string; content: string }) => {
    return await blogApiClient.post('/api/blog/posts', data);
  },

  updatePost: async (id: string, data: { title?: string; category?: string; cover?: string; content?: string }) => {
    return await blogApiClient.put(`/api/blog/posts/${id}`, data);
  },

  deletePost: async (id: string) => {
    return await blogApiClient.delete(`/api/blog/posts/${id}`);
  },

  getSettings: async () => {
    return await blogApiClient.get('/api/blog/settings');
  },

  updateSettings: async (data: { siteName?: string; categories?: string[]; bio?: string; socialLinks?: { platform: string; url: string }[] }) => {
    return await blogApiClient.put('/api/blog/settings', data);
  },

  getUserInfo: async () => {
    const token = localStorage.getItem('access_token');
    return await blogApiClient.get('/api/blog/user-info', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateUserProfile: async (data: { username: string }) => {
    const token = localStorage.getItem('access_token');
    return await blogApiClient.put('/api/blog/user-profile', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getServerStatus: async () => {
    return await blogApiClient.get('/api/blog/server-status');
  },

  uploadFile: async (formData: FormData) => {
    return await blogApiClient.post('/api/blog/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const brainApi = {
  getTasks: async (): Promise<{ tasks: any[] }> => {
    try {
      const res = await apiClient.get('/tasks');
      const data = (res as any).data;
      return data?.data || data || { tasks: [] };
    } catch {
      return { tasks: [] };
    }
  },

  createTask: async (data: { content: string; quadrant: string }): Promise<any> => {
    try {
      const res = await apiClient.post('/tasks', data);
      const body = (res as any).data;
      return body?.data || body;
    } catch {
      return null;
    }
  },

  updateTask: async (id: string, data: { is_completed: boolean }): Promise<any> => {
    try {
      const res = await apiClient.put(`/tasks/${id}`, data);
      const body = (res as any).data;
      return body?.data || body;
    } catch {
      return null;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch {
    }
  },
};

export default apiClient;
