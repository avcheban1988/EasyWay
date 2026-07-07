import { api } from '@/lib/api';
import { create } from 'zustand';

export type GoalType = 'lose' | 'maintain' | 'gain' | 'manual';
export type GenderType = 'male' | 'female';
export type ActivityLevelType = 'minimal' | 'light' | 'moderate' | 'high' | 'extreme';

export interface UserProfile {
  name: string;
  goal: GoalType | null;
  gender: GenderType | null;
  age: number | null;
  birthDate: string | null; // ISO format: YYYY-MM-DD
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevelType | null;
  gymDaysPerWeek: number | null;
  isMassGainMode: boolean;
  isOnboarded: boolean;
  isPremium: boolean;
  manualProteins: number | null;
  manualFats: number | null;
  manualCarbs: number | null;
}

export interface DailyMacros {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

interface UserStore {
  userProfile: UserProfile;
  dailyMacros: DailyMacros | null;
  profileHydrated: boolean;
  setGoal: (goal: GoalType) => void;
  setName: (name: string) => void;
  setGender: (gender: GenderType) => void;
  setAge: (age: number) => void;
  setBirthDate: (date: string) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setActivityLevel: (level: ActivityLevelType) => void;
  setGymDaysPerWeek: (days: number) => void;
  setMassGainMode: (enabled: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
  setManualMacros: (proteins: number, fats: number, carbs: number) => void;
  calculateMacros: () => void;
  resetProfile: () => void;
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: '',
  goal: null,
  gender: null,
  age: null,
  birthDate: null,
  height: null,
  weight: null,
  activityLevel: null,
  gymDaysPerWeek: null,
  isMassGainMode: false,
  isOnboarded: false,
  isPremium: false,
  manualProteins: null,
  manualFats: null,
  manualCarbs: null,
};

function mapApiToProfile(u: any): UserProfile {
  return {
    name: u.name || '',
    goal: u.goal || null,
    gender: u.gender || null,
    age: u.age ?? null,
    birthDate: u.birth_date || null,
    height: u.height ?? null,
    weight: u.weight ?? null,
    activityLevel: u.activity_level || null,
    gymDaysPerWeek: u.gym_days_per_week ?? null,
    isMassGainMode: !!u.is_mass_gain_mode,
    isOnboarded: !!u.is_onboarded,
    isPremium: !!u.is_premium,
    manualProteins: u.manual_proteins ?? null,
    manualFats: u.manual_fats ?? null,
    manualCarbs: u.manual_carbs ?? null,
  };
}

function mapApiToMacros(u: any): DailyMacros | null {
  if (u.daily_calories == null) return null;
  return {
    calories: u.daily_calories,
    proteins: u.daily_proteins || 0,
    fats: u.daily_fats || 0,
    carbs: u.daily_carbs || 0,
  };
}

// Вычисляет возраст из даты рождения
function calculateAgeFromBirthDate(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Создает дату рождения из возраста (предполагая 1-е января текущего года)
function createBirthDateFromAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

export const useUserStore = create<UserStore>((set, get) => ({
  userProfile: defaultProfile,
  dailyMacros: null,
  profileHydrated: false,

  setGoal: (goal) => set((s) => ({ userProfile: { ...s.userProfile, goal } })),
  setName: (name) => set((s) => ({ userProfile: { ...s.userProfile, name } })),
  setGender: (gender) => set((s) => ({ userProfile: { ...s.userProfile, gender } })),
  setAge: (age) => {
    const birthDate = createBirthDateFromAge(age);
    set((s) => ({ userProfile: { ...s.userProfile, age, birthDate } }));
  },
  setBirthDate: (birthDate: string) => {
    const age = calculateAgeFromBirthDate(birthDate);
    set((s) => ({ userProfile: { ...s.userProfile, birthDate, age } }));
  },
  setHeight: (height) => set((s) => ({ userProfile: { ...s.userProfile, height } })),
  setWeight: (weight) => set((s) => ({ userProfile: { ...s.userProfile, weight } })),
  setActivityLevel: (activityLevel) => set((s) => ({ userProfile: { ...s.userProfile, activityLevel } })),
  setGymDaysPerWeek: (gymDaysPerWeek) => set((s) => ({ userProfile: { ...s.userProfile, gymDaysPerWeek } })),
  setMassGainMode: (isMassGainMode) => set((s) => ({ userProfile: { ...s.userProfile, isMassGainMode } })),

  setManualMacros: (proteins, fats, carbs) => set((s) => ({
    userProfile: { ...s.userProfile, manualProteins: proteins, manualFats: fats, manualCarbs: carbs },
    dailyMacros: { calories: proteins * 4 + fats * 9 + carbs * 4, proteins, fats, carbs },
  })),

  setIsOnboarded: (isOnboarded) => set((s) => ({ userProfile: { ...s.userProfile, isOnboarded } })),

  calculateMacros: () => {
    const { userProfile } = get();
    if (!userProfile.gender || !userProfile.age || !userProfile.height ||
        !userProfile.weight || !userProfile.activityLevel) return;

    let bmr: number;
    if (userProfile.gender === 'male') {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      minimal: 1.2, light: 1.375, moderate: 1.55, high: 1.725, extreme: 1.9,
    };

    let dailyCalories = bmr * (activityMultipliers[userProfile.activityLevel] || 1.55);

    if (userProfile.goal === 'lose') dailyCalories -= 500;
    else if (userProfile.goal === 'gain') dailyCalories += 300;

    const isActive = userProfile.gymDaysPerWeek !== null && userProfile.gymDaysPerWeek >= 3;
    const proteinPerKg = isActive || userProfile.isMassGainMode ? 2.0 : 1.3;
    const proteins = userProfile.weight * proteinPerKg;
    const fats = userProfile.weight * 0.9;
    const proteinCalories = proteins * 4;
    const fatCalories = fats * 9;
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4;

    set({
      dailyMacros: {
        calories: Math.round(dailyCalories),
        proteins: Math.round(proteins),
        fats: Math.round(fats),
        carbs: Math.round(carbs),
      },
    });
  },

  resetProfile: () => set({ userProfile: defaultProfile, dailyMacros: null }),

  loadProfile: async () => {
    try {
      const u = await api.getProfile();
      set({
        userProfile: mapApiToProfile(u),
        dailyMacros: mapApiToMacros(u),
        profileHydrated: true,
      });
    } catch {
      set({ profileHydrated: true });
    }
  },

  saveProfile: async () => {
    const { userProfile, dailyMacros } = get();
    const token = api.getToken();
    
    // Если нет токена — не шлём запрос (офлайн-режим)
    if (!token) {
      console.warn('saveProfile: нет токена, пропускаем');
      return;
    }

    const data: any = {
      name: userProfile.name,
      goal: userProfile.goal,
      gender: userProfile.gender,
      birth_date: userProfile.birthDate,
      height: userProfile.height,
      weight: userProfile.weight,
      activity_level: userProfile.activityLevel,
      gym_days_per_week: userProfile.gymDaysPerWeek,
      is_mass_gain_mode: userProfile.isMassGainMode,
      is_onboarded: userProfile.isOnboarded,
    };

    if (userProfile.goal === 'manual') {
      data.manual_proteins = userProfile.manualProteins;
      data.manual_fats = userProfile.manualFats;
      data.manual_carbs = userProfile.manualCarbs;
    }

    if (dailyMacros) {
      data.daily_calories = dailyMacros.calories;
      data.daily_proteins = dailyMacros.proteins;
      data.daily_fats = dailyMacros.fats;
      data.daily_carbs = dailyMacros.carbs;
    }

    try {
      console.log('[saveProfile] Отправка данных:', { token: token.substring(0, 20) + '...', data });
      const result = await api.updateProfile(data);
      console.log('[saveProfile] Ответ получен:', result);
      
      // Обновляем данные из ответа
      set({
        userProfile: {
          ...userProfile,
          name: result.name || userProfile.name,
          goal: result.goal || userProfile.goal,
        },
        dailyMacros: result.daily_calories ? {
          calories: result.daily_calories,
          proteins: result.daily_proteins || 0,
          fats: result.daily_fats || 0,
          carbs: result.daily_carbs || 0,
        } : dailyMacros,
      });
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      console.error('[saveProfile] Ошибка при сохранении:', {
        message: errorMsg,
        stack: e?.stack,
      });
      // Ошибка игнорируется, но логируется для отладки
    }
  },
}));
