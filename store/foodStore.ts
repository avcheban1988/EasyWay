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
  recentProducts: { name: string; grams: number }[];
  hydrated: boolean;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'date'> & { date?: string }) => Promise<void>;
  removeFoodEntry: (id: string) => void;
  getEntriesForDate: (date: string) => FoodEntry[];
  getTotalsForDate: (date: string) => MacroTotals;
  loadFoodEntries: (date?: string) => Promise<void>;
  loadRecentProducts: () => Promise<void>;
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  foodEntries: [],
  recentProducts: [],
  hydrated: false,

  loadFoodEntries: async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().slice(0, 10);
      const entries = await api.getFoodEntries(targetDate);
      // Загружаем недавние продукты
      let recent: { name: string; grams: number }[] = [];
      try {
        recent = await api.getRecentProducts();
      } catch {}
      set({ foodEntries: entries, recentProducts: recent, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  loadRecentProducts: async () => {
    try {
      const recent = await api.getRecentProducts();
      set({ recentProducts: recent });
    } catch {}
  },

  addFoodEntry: async (entry) => {
    try {
      const created = await api.addFoodEntry(entry);
      set((s) => ({
        foodEntries: [...s.foodEntries, created],
      }));
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
      set((s) => ({
        foodEntries: [...s.foodEntries, local],
      }));
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
