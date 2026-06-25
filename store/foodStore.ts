import AsyncStorage from '@react-native-async-storage/async-storage';
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
  date: string; // YYYY-MM-DD
}

interface FoodStore {
  activeEmail: string | null;
  foodEntries: FoodEntry[];
  foodHydrated: boolean;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'date'> & { date?: string }) => void;
  removeFoodEntry: (id: string) => void;
  getTodayEntries: () => FoodEntry[];
  getTodayTotals: () => MacroTotals;
  getWeekEntries: () => FoodEntry[];
  getWeekTotals: () => MacroTotals;
  getEntriesForDate: (date: string) => FoodEntry[];
  getTotalsForDate: (date: string) => MacroTotals;
  loadFoodEntries: (email?: string | null) => Promise<void>;
  saveFoodEntries: () => Promise<void>;
  resetFoodEntries: () => void;
}

type MacroTotals = {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
};

const STORAGE_KEY = 'foodEntries';

const getDateKey = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export const useFoodStore = create<FoodStore>((set, get) => ({
  activeEmail: null,
  foodEntries: [],
  foodHydrated: false,

  addFoodEntry: (entry) => {
    const date = entry.date ?? getDateKey();
    const newEntry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      mealType: entry.mealType,
      name: entry.name,
      calories: entry.calories,
      proteins: entry.proteins,
      fats: entry.fats,
      carbs: entry.carbs,
      date,
    };
    set((state) => ({ foodEntries: [...state.foodEntries, newEntry] }));
    get().saveFoodEntries();
  },

  removeFoodEntry: (id) => {
    set((state) => ({ foodEntries: state.foodEntries.filter((entry) => entry.id !== id) }));
    get().saveFoodEntries();
  },

  getTodayEntries: () => {
    const today = getDateKey();
    return get().foodEntries.filter((entry) => entry.date === today);
  },

  getTodayTotals: () => {
    const today = getDateKey();
    const items = get().foodEntries.filter((entry) => entry.date === today);
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        proteins: totals.proteins + item.proteins,
        fats: totals.fats + item.fats,
        carbs: totals.carbs + item.carbs,
      }),
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );
  },

  getEntriesForDate: (date: string) => {
    return get().foodEntries.filter((entry) => entry.date === date);
  },

  getTotalsForDate: (date: string) => {
    const items = get().foodEntries.filter((entry) => entry.date === date);
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        proteins: totals.proteins + item.proteins,
        fats: totals.fats + item.fats,
        carbs: totals.carbs + item.carbs,
      }),
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );
  },

  getWeekEntries: () => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return get().foodEntries.filter((entry) => dates.includes(entry.date));
  },

  getWeekTotals: () => {
    const items = get().getWeekEntries();
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        proteins: totals.proteins + item.proteins,
        fats: totals.fats + item.fats,
        carbs: totals.carbs + item.carbs,
      }),
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );
  },

  loadFoodEntries: async (email?: string | null) => {
    try {
      const activeEmail = email ?? null;
      const normalizedEmail = activeEmail?.trim().toLowerCase() ?? null;
      const currentNormalizedEmail = get().activeEmail?.trim().toLowerCase() ?? null;
      if (get().foodHydrated && currentNormalizedEmail === normalizedEmail) return;

      set({ activeEmail: activeEmail ?? null, foodHydrated: false });

      const entriesKey = normalizedEmail ? `foodEntries:${normalizedEmail}` : STORAGE_KEY;
      const legacyJson = normalizedEmail ? await AsyncStorage.getItem(STORAGE_KEY) : null;
      const json = await AsyncStorage.getItem(entriesKey);
      if (json) {
        const parsed: FoodEntry[] = JSON.parse(json);
        set({ foodEntries: parsed });
      } else if (legacyJson) {
        const parsed: FoodEntry[] = JSON.parse(legacyJson);
        set({ foodEntries: parsed });
      }

      set({ foodHydrated: true });
    } catch (error) {
      console.error('Error loading food entries', error);
      set({ foodHydrated: true });
    }
  },

  saveFoodEntries: async () => {
    try {
      const normalizedEmail = get().activeEmail?.trim().toLowerCase() ?? null;
      const entriesKey = normalizedEmail ? `foodEntries:${normalizedEmail}` : STORAGE_KEY;
      await AsyncStorage.setItem(entriesKey, JSON.stringify(get().foodEntries));
      set({ foodHydrated: true });
    } catch (error) {
      console.error('Error saving food entries', error);
    }
  },

  resetFoodEntries: () => {
    set({ foodEntries: [] });
    set({ foodHydrated: false });
    const normalizedEmail = get().activeEmail?.trim().toLowerCase() ?? null;
    const entriesKey = normalizedEmail ? `foodEntries:${normalizedEmail}` : STORAGE_KEY;
    AsyncStorage.removeItem(entriesKey).catch((error) => console.error(error));
  },
}));
