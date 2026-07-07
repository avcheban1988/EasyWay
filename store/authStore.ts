import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface AuthAccount {
  email: string;
  createdAt: string;
}

interface AuthStore {
  account: AuthAccount | null;
  token: string | null;
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  hydrated: boolean;
  checkAuth: () => Promise<void>;
  signUp: (params: { email: string; password: string }) => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = 'authToken';
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const useAuthStore = create<AuthStore>((set, get) => ({
  account: null,
  token: null,
  status: 'idle',
  hydrated: false,

  checkAuth: async () => {
    if (get().hydrated) return;
    set({ status: 'checking' });

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        set({ account: null, token: null, status: 'unauthenticated', hydrated: true });
        return;
      }
      api.setToken(token);
      const user = await api.getProfile();
      set({
        account: { email: user.email, createdAt: new Date().toISOString() },
        token,
        status: 'authenticated',
        hydrated: true,
      });
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ account: null, token: null, status: 'unauthenticated', hydrated: true });
    }
  },

  signUp: async ({ email, password }) => {
    const res = await api.register(email, password);
    api.setToken(res.token);
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    set({
      account: { email: normalizeEmail(email), createdAt: new Date().toISOString() },
      token: res.token,
      status: 'authenticated',
      hydrated: true,
    });
  },

  signIn: async ({ email, password }) => {
    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      set({
        account: { email: normalizeEmail(email), createdAt: new Date().toISOString() },
        token: res.token,
        status: 'authenticated',
        hydrated: true,
      });
      return true;
    } catch {
      return false;
    }
  },

  signOut: async () => {
    api.setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ account: null, token: null, status: 'unauthenticated' });
  },
}));
