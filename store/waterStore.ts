import { api } from '@/lib/api';
import { create } from 'zustand';

interface WaterStore {
  ml: number;
  targetMl: number;
  hydrated: boolean;
  load: () => Promise<void>;
  setWater: (ml: number) => Promise<void>;
  addWater: (addMl: number) => Promise<void>;
}

export const useWaterStore = create<WaterStore>((set, get) => ({
  ml: 0,
  targetMl: 2000,
  hydrated: false,

  load: async () => {
    try {
      const data = await api.getWaterIntake();
      set({ ml: data.ml, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setWater: async (ml) => {
    set({ ml });
    try {
      await api.addWaterIntake(ml);
    } catch {
      // ignore
    }
  },

  addWater: async (addMl) => {
    const newMl = get().ml + addMl;
    await get().setWater(newMl);
  },
}));
