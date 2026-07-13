import { api } from '@/lib/api';
import { create } from 'zustand';

export type MealType = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус';

export interface FoodEntry {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  date: string;
  grams?: number;
}

type MacroTotals = { calories: number; proteins: number; fats: number; carbs: number };

interface FoodStore {
  foodEntries: FoodEntry[];
  hydrated: boolean;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'date'> & { date?: string }) => Promise<void>;
  removeFoodEntry: (id: string) => void;
  getEntriesForDate: (date: string) => FoodEntry[];
  getTotalsForDate: (date: string) => MacroTotals;
  loadFoodEntries: () => Promise<void>;
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  foodEntries: [],
  hydrated: false,

  loadFoodEntries: async () => {
    try {
      const entries = await api.getFoodEntries(new Date().toISOString().slice(0, 10));
      set({ foodEntries: entries, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addFoodEntry: async (entry) => {
    try {
      const created = await api.addFoodEntry(entry);
      set((s) => ({ foodEntries: [...s.foodEntries, created] }));
    } catch {
      const local: FoodEntry = {
        id: `tmp-${Date.now()}`,
        mealType: entry.mealType,
        name: entry.name,
        calories: entry.calories,
        proteins: entry.proteins,
        fats: entry.fats,
        carbs: entry.carbs,
        grams: entry.grams,
        date: entry.date || new Date().toISOString().slice(0, 10),
      };
      set((s) => ({ foodEntries: [...s.foodEntries, local] }));
    }
  },

  removeFoodEntry: (id) => {
    api.deleteFoodEntry(id).catch(() => {});
    set((s) => ({ foodEntries: s.foodEntries.filter((e) => e.id !== id) }));
  },

  resetFoodEntries: () => set({ foodEntries: [], hydrated: false }),

  getEntriesForDate: (date) => {
    const dateStr = date.slice(0, 10);
    return get().foodEntries.filter((entry) => (entry.date || '').slice(0, 10) === dateStr);
  },

  getTotalsForDate: (date) => {
    const dateStr = date.slice(0, 10);
    const items = get().foodEntries.filter((entry) => (entry.date || '').slice(0, 10) === dateStr);
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        proteins: totals.proteins + Number(item.proteins),
        fats: totals.fats + Number(item.fats),
        carbs: totals.carbs + Number(item.carbs),
      }),
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );
  },
}));
