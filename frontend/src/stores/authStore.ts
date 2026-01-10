import { create } from 'zustand';
import { User } from '../types';
import { authService, setToken, removeToken, getToken } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { displayName?: string; username?: string; phone?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      await setToken(response.data.token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (email: string, password: string, username: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ email, password, username, displayName });
      await setToken(response.data.token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await removeToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = await getToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authService.getProfile();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      await removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateProfile(data);
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Update failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updateProfile({ currentPassword, newPassword });
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password update failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateAvatar: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateAvatar(formData);
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Avatar update failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),
}));
