import { ActivityLevelType } from '@/store/userStore';

export interface ActivityLevel {
  id: ActivityLevelType;
  title: string;
  description: string;
  multiplier: number;
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    id: 'minimal',
    title: 'Минимум',
    description: 'Сидячая работа, без спорта',
    multiplier: 1.2,
  },
  {
    id: 'light',
    title: 'Легкая активность',
    description: '1-3 тренировки в неделю, много ходьбы',
    multiplier: 1.375,
  },
  {
    id: 'moderate',
    title: 'Средняя',
    description: '3-5 тренировок в неделю',
    multiplier: 1.55,
  },
  {
    id: 'high',
    title: 'Высокая',
    description: 'Ежедневные тренировки + физическая работа',
    multiplier: 1.725,
  },
  {
    id: 'extreme',
    title: 'Экстрим',
    description: '2+ тренировки в день, подготовка к соревнованиям',
    multiplier: 1.9,
  },
];
