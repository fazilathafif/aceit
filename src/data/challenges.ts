export type ChallengeProgressKey =
  | 'quizzesCompleted'
  | 'highAccuracyCount'
  | 'perfectCount'
  | 'breathingCount'
  | 'subjectsStudied';

export interface ChallengeDefinition {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  target: number;
  progressKey: ChallengeProgressKey;
}

export const DAILY_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'd_quiz1',
    type: 'daily',
    title: 'First Quiz',
    description: 'Complete 1 quiz today',
    icon: '📝',
    xpReward: 20,
    target: 1,
    progressKey: 'quizzesCompleted',
  },
  {
    id: 'd_quiz3',
    type: 'daily',
    title: 'Triple Threat',
    description: 'Complete 3 quizzes today',
    icon: '🔥',
    xpReward: 50,
    target: 3,
    progressKey: 'quizzesCompleted',
  },
  {
    id: 'd_acc',
    type: 'daily',
    title: 'Sharp Shooter',
    description: 'Score 80%+ on any quiz',
    icon: '🎯',
    xpReward: 30,
    target: 1,
    progressKey: 'highAccuracyCount',
  },
  {
    id: 'd_perf',
    type: 'daily',
    title: 'Perfect Day',
    description: 'Get a perfect score on any quiz',
    icon: '💯',
    xpReward: 50,
    target: 1,
    progressKey: 'perfectCount',
  },
  {
    id: 'd_breath',
    type: 'daily',
    title: 'Mindful Break',
    description: 'Complete a breathing exercise',
    icon: '🫁',
    xpReward: 15,
    target: 1,
    progressKey: 'breathingCount',
  },
  {
    id: 'd_subs',
    type: 'daily',
    title: 'Multitasker',
    description: 'Study 2 different subjects today',
    icon: '📚',
    xpReward: 40,
    target: 2,
    progressKey: 'subjectsStudied',
  },
];

export const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'w_quiz10',
    type: 'weekly',
    title: 'Quiz Marathon',
    description: 'Complete 10 quizzes this week',
    icon: '🏆',
    xpReward: 100,
    target: 10,
    progressKey: 'quizzesCompleted',
  },
  {
    id: 'w_subs3',
    type: 'weekly',
    title: 'Full Coverage',
    description: 'Study all 3 subjects this week',
    icon: '🌐',
    xpReward: 80,
    target: 3,
    progressKey: 'subjectsStudied',
  },
  {
    id: 'w_acc5',
    type: 'weekly',
    title: 'Consistency King',
    description: 'Score 80%+ on 5 quizzes this week',
    icon: '⚡',
    xpReward: 100,
    target: 5,
    progressKey: 'highAccuracyCount',
  },
];

export const ALL_CHALLENGES = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];
