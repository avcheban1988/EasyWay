import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthAccount {
  email: string;
  createdAt: string;
}

interface AuthStore {
  account: AuthAccount | null;
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  hydrated: boolean;
  checkAuth: () => Promise<void>;
  signUp: (params: { email: string; password: string }) => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = 'authAccount';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const useAuthStore = create<AuthStore>((set, get) => ({
  account: null,
  status: 'idle',
  hydrated: false,

  checkAuth: async () => {
    if (get().hydrated) return;

    set({ status: 'checking' });

    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) {
        set({ account: null, status: 'unauthenticated', hydrated: true });
        return;
      }

      const parsed = JSON.parse(json) as Partial<AuthAccount>;
      if (parsed && typeof parsed.email === 'string' && typeof parsed.createdAt === 'string') {
        set({ account: { email: parsed.email, createdAt: parsed.createdAt }, status: 'authenticated', hydrated: true });
        return;
      }

      // Corrupted storage - reset.
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ account: null, status: 'unauthenticated', hydrated: true });
    } catch (e) {
      console.error('Error checking auth:', e);
      set({ account: null, status: 'unauthenticated', hydrated: true });
    }
  },

  signUp: async ({ email }) => {
    const createdAt = new Date().toISOString();
    const account: AuthAccount = { email: normalizeEmail(email), createdAt };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    set({ account, status: 'authenticated', hydrated: true });
  },

  // Local prototype: accept any valid email/password combination for now (no backend validation)
  signIn: async ({ email }) => {
    const createdAt = new Date().toISOString();
    const account: AuthAccount = { email: normalizeEmail(email), createdAt };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    set({ account, status: 'authenticated', hydrated: true });
    return true;
  },

  signOut: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ account: null, status: 'unauthenticated' });
  },
}));

