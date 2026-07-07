import { api } from '@/lib/api';
import { create } from 'zustand';

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

interface WeightStore {
  entries: WeightEntry[];
  hydrated: boolean;
  addEntry: (weight: number, date?: string) => Promise<void>;
  loadEntries: () => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export const useWeightStore = create<WeightStore>((set, get) => ({
  entries: [],
  hydrated: false,

  loadEntries: async () => {
    if (get().hydrated) return;
    try {
      const entries = await api.getWeightEntries();
      set({ entries, hydrated: true });
    } catch {
      set({ entries: [], hydrated: true });
    }
  },

  addEntry: async (weight, date) => {
    try {
      const created = await api.addWeightEntry(weight, date);
      // Обновляем или добавляем
      set((s) => {
        const filtered = s.entries.filter((e) => e.date !== created.date);
        return { entries: [created, ...filtered] };
      });
    } catch {
      const d = date ?? new Date().toISOString().slice(0, 10);
      const entry = { id: `tmp-${Date.now()}`, date: d, weight };
      set((s) => {
        const filtered = s.entries.filter((e) => e.date !== d);
        return { entries: [entry, ...filtered] };
      });
    }
  },

  removeEntry: async (id) => {
    try {
      await api.deleteProduct(id);
    } catch {}
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },
}));
