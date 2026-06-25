import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Типы для хранения пользовательских данных
export type GoalType = 'lose' | 'maintain' | 'gain' | 'manual';

export type GenderType = 'male' | 'female';

export type ActivityLevelType = 'minimal' | 'light' | 'moderate' | 'high' | 'extreme';

export interface UserProfile {
  name: string;
  goal: GoalType | null;
  gender: GenderType | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevelType | null;
  gymDaysPerWeek: number | null;
  isMassGainMode: boolean;
  isOnboarded: boolean;
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
  activeEmail: string | null;
  userProfile: UserProfile;
  dailyMacros: DailyMacros | null;
  profileHydrated: boolean;
  setGoal: (goal: GoalType) => void;
  setName: (name: string) => void;
  setGender: (gender: GenderType) => void;
  setAge: (age: number) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setActivityLevel: (level: ActivityLevelType) => void;
  setGymDaysPerWeek: (days: number) => void;
  setMassGainMode: (enabled: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
  setManualMacros: (proteins: number, fats: number, carbs: number) => void;
  calculateMacros: () => void;
  resetProfile: () => void;
  loadProfile: (email?: string | null) => Promise<void>;
  saveProfile: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: '',
  goal: null,
  gender: null,
  age: null,
  height: null,
  weight: null,
  activityLevel: null,
  gymDaysPerWeek: null,
  isMassGainMode: false,
  isOnboarded: false,
  manualProteins: null,
  manualFats: null,
  manualCarbs: null,
};

export const useUserStore = create<UserStore>((set, get) => ({
  activeEmail: null,
  userProfile: defaultProfile,
  dailyMacros: null,
  profileHydrated: false,

  setGoal: (goal) => set((state) => ({
    userProfile: { ...state.userProfile, goal }
  })),

  setGender: (gender) => set((state) => ({
    userProfile: { ...state.userProfile, gender }
  })),

  setName: (name) => set((state) => ({
    userProfile: { ...state.userProfile, name }
  })),

  setAge: (age) => set((state) => ({
    userProfile: { ...state.userProfile, age }
  })),

  setHeight: (height) => set((state) => ({
    userProfile: { ...state.userProfile, height }
  })),

  setWeight: (weight) => set((state) => ({
    userProfile: { ...state.userProfile, weight }
  })),

  setActivityLevel: (activityLevel) => set((state) => ({
    userProfile: { ...state.userProfile, activityLevel }
  })),

  setGymDaysPerWeek: (gymDaysPerWeek) => set((state) => ({
    userProfile: { ...state.userProfile, gymDaysPerWeek }
  })),

  setMassGainMode: (isMassGainMode) => set((state) => ({
    userProfile: { ...state.userProfile, isMassGainMode }
  })),

  setManualMacros: (proteins, fats, carbs) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      manualProteins: proteins,
      manualFats: fats,
      manualCarbs: carbs,
    },
    dailyMacros: {
      calories: proteins * 4 + fats * 9 + carbs * 4,
      proteins,
      fats,
      carbs,
    },
  })),

  setIsOnboarded: (isOnboarded) => set((state) => ({
    userProfile: { ...state.userProfile, isOnboarded }
  })),

  calculateMacros: () => {
    const { userProfile } = get();
    if (!userProfile.gender || !userProfile.age || !userProfile.height || 
        !userProfile.weight || !userProfile.activityLevel) {
      return;
    }

    // Формула Миффлина-Сан-Жеора для BMR
    let bmr: number;
    if (userProfile.gender === 'male') {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }

    // Коэффициенты активности
    const activityMultipliers = {
      minimal: 1.2,
      light: 1.375,
      moderate: 1.55,
      high: 1.725,
      extreme: 1.9,
    };

    // Базовая калорийность с учетом активности
    let dailyCalories = bmr * activityMultipliers[userProfile.activityLevel];

    // Корректировка в зависимости от цели
    if (userProfile.goal === 'lose') {
      dailyCalories -= 500; // Дефицит для похудения
    } else if (userProfile.goal === 'gain') {
      dailyCalories += 300; // Профицит для набора массы
    }

    // Расчет белков
    const isActive = userProfile.gymDaysPerWeek !== null && userProfile.gymDaysPerWeek >= 3;
    const proteinPerKg = isActive || userProfile.isMassGainMode ? 2.0 : 1.3;
    const proteins = userProfile.weight * proteinPerKg;

    // Расчет жиров
    const fats = userProfile.weight * 0.9;

    // Расчет углеводов (остаток калорий)
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

  resetProfile: () => set({
    userProfile: defaultProfile,
    dailyMacros: null,
    profileHydrated: false,
  }),

  loadProfile: async (email?: string | null) => {
    try {
      const activeEmail = email ?? null;
      const normalizedEmail = activeEmail ? activeEmail.trim().toLowerCase() : null;

      const currentNormalizedEmail = get().activeEmail?.trim().toLowerCase() ?? null;
      if (get().profileHydrated && currentNormalizedEmail === normalizedEmail) return;

      set({ activeEmail: activeEmail ?? null, profileHydrated: false });

      const profileKey = normalizedEmail ? `userProfile:${normalizedEmail}` : 'userProfile';
      const macrosKey = normalizedEmail ? `dailyMacros:${normalizedEmail}` : 'dailyMacros';

      const legacyProfileJson = normalizedEmail ? await AsyncStorage.getItem('userProfile') : null;
      const legacyMacrosJson = normalizedEmail ? await AsyncStorage.getItem('dailyMacros') : null;

      const profileJson = await AsyncStorage.getItem(profileKey);
      const macrosJson = await AsyncStorage.getItem(macrosKey);

      if (profileJson) {
        set({
          userProfile: JSON.parse(profileJson),
        });
      } else if (legacyProfileJson) {
        // Backward compatibility: if there is old global profile on device.
        set({
          userProfile: JSON.parse(legacyProfileJson),
        });
      }

      if (macrosJson) {
        set({
          dailyMacros: JSON.parse(macrosJson),
        });
      } else if (legacyMacrosJson) {
        set({
          dailyMacros: JSON.parse(legacyMacrosJson),
        });
      }

      set({ profileHydrated: true });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ profileHydrated: true });
    }
  },

  saveProfile: async () => {
    try {
      const normalizedEmail = get().activeEmail?.trim().toLowerCase() ?? null;
      const profileKey = normalizedEmail ? `userProfile:${normalizedEmail}` : 'userProfile';
      const macrosKey = normalizedEmail ? `dailyMacros:${normalizedEmail}` : 'dailyMacros';

      const { userProfile, dailyMacros } = get();
      await AsyncStorage.setItem(profileKey, JSON.stringify(userProfile));
      if (dailyMacros) {
        await AsyncStorage.setItem(macrosKey, JSON.stringify(dailyMacros));
      }

      set({ profileHydrated: true });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },
}));
