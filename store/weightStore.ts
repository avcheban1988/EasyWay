import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

interface WeightStore {
  entries: WeightEntry[];
  hydrated: boolean;
  addEntry: (weight: number, date?: string) => Promise<void>;
  loadEntries: () => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'weightEntries';

export const useWeightStore = create<WeightStore>((set, get) => ({
  entries: [],
  hydrated: false,

  loadEntries: async () => {
    try {
      if (get().hydrated) return;
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed: WeightEntry[] = JSON.parse(json);
        set({ entries: parsed, hydrated: true });
      } else {
        set({ entries: [], hydrated: true });
      }
    } catch (e) {
      console.error('Error loading weight entries', e);
      set({ entries: [], hydrated: true });
    }
  },

  addEntry: async (weight, date) => {
    try {
      const d = date ?? new Date().toISOString().slice(0, 10);
      const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, date: d, weight };
      const newArr = [entry, ...get().entries].sort((a, b) => (a.date < b.date ? 1 : -1));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArr));
      set({ entries: newArr });
    } catch (e) {
      console.error('Error saving weight entry', e);
    }
  },

  removeEntry: async (id) => {
    try {
      const filtered = get().entries.filter((e) => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      set({ entries: filtered });
    } catch (e) {
      console.error('Error removing weight entry', e);
    }
  },
}));

export default useWeightStore;
