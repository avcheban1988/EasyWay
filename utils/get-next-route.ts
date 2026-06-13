import type { Href } from 'expo-router';
import type { UserProfile } from '@/store/userStore';

/** Следующий экран после авторизации или welcome для уже вошедшего пользователя. */
export function getNextOnboardingRoute(profile: UserProfile): Href {
  if (profile.isOnboarded) return '/(tabs)';
  if (!profile.goal) return '/onboarding/goal';
  if (!profile.gender || profile.age === null || profile.height === null || profile.weight === null) {
    return '/onboarding/anthropometry';
  }
  if (!profile.activityLevel) return '/onboarding/activity';
  if (profile.gymDaysPerWeek === null) return '/onboarding/gym-frequency';
  return '/onboarding/results';
}
