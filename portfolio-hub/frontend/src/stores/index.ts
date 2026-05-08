import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Clothing } from '@/types';
import { authApi, clothesApi } from '@/services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await authApi.login(email, password);

          // 同时保存 token 到 localStorage（供 axios 拦截器使用）
          localStorage.setItem('access_token', result.access_token);
          if (result.refresh_token) {
            localStorage.setItem('refresh_token', result.refresh_token);
          }

          set({
            user: result.user,
            accessToken: result.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await authApi.register(email, password);

          // 同时保存 token 到 localStorage（供 axios 拦截器使用）
          localStorage.setItem('access_token', result.access_token);
          if (result.refresh_token) {
            localStorage.setItem('refresh_token', result.refresh_token);
          }

          set({
            user: result.user,
            accessToken: result.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          // 清除所有登录相关的本地存储
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');

          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, accessToken: token });
        } catch {
          localStorage.removeItem('access_token');
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      setUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);

interface WardrobeState {
  clothes: Clothing[];
  selectedClothing: Clothing | null;
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  filters: {
    category: string | null;
    searchQuery: string;
    wardrobeType: string;
  };

  fetchClothes: (page?: number) => Promise<void>;
  setSelectedClothing: (clothing: Clothing | null) => void;
  deleteClothing: (id: string) => Promise<void>;
  markAsWorn: (id: string) => Promise<void>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
}

export const useWardrobeStore = create<WardrobeState>()((set, get) => ({
  clothes: [],
  selectedClothing: null,
  isLoading: false,
  currentPage: 1,
  totalItems: 0,
  filters: {
    category: null,
    searchQuery: '',
    wardrobeType: 'all',
  },

  fetchClothes: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params: any = { page, per_page: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.wardrobeType && filters.wardrobeType !== 'all') {
        params.wardrobe_type = filters.wardrobeType;
      }
      if (filters.searchQuery) params.search = filters.searchQuery;

      const result = await clothesApi.list(params);

      set({
        clothes: result.items,
        currentPage: result.pagination.page,
        totalItems: result.pagination.total_items,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      console.error('Failed to fetch clothes:', err);
    }
  },

  setSelectedClothing: (clothing) => set({ selectedClothing: clothing }),

  deleteClothing: async (id) => {
    try {
      await clothesApi.delete(id);
      set((state) => ({
        clothes: state.clothes.filter((c) => c.id !== id),
        totalItems: state.totalItems - 1,
      }));
    } catch (err) {
      console.error('Failed to delete clothing:', err);
    }
  },

  markAsWorn: async (id) => {
    try {
      await clothesApi.update(id, { last_worn_date: new Date().toISOString() } as any);
      set((state) => ({
        clothes: state.clothes.map((c) =>
          c.id === id ? { ...c, last_worn_date: new Date().toISOString() } : c
        ),
      }));
    } catch (err) {
      console.error('Failed to mark as worn:', err);
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().fetchClothes(1);
  },

  clearFilters: () => {
    set({
      filters: {
        category: null,
        searchQuery: '',
        wardrobeType: 'all',
      },
    });
    get().fetchClothes(1);
  },
}));
