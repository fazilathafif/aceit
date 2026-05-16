import { getToday, getWeekKey } from './gameUtils';
import { BADGE_DEFINITIONS } from '../data/badges';
import type { GameProfile, DailyState, WeeklyState, QuizHistory } from '../types';

// Seeds XP, badges, streak, history — runs only once
export function seedDemoProfile(): void {
  const examDate = new Date();
  examDate.setMonth(examDate.getMonth() + 3);

  const profile: GameProfile = {
    xp: 2700,
    streak: 15,
    lastActiveDate: getToday(),
    freezeTokens: 2,
    earnedBadgeIds: BADGE_DEFINITIONS.map((b) => b.id),
    examDate: examDate.toISOString().split('T')[0],
    totalQuizzes: 28,
    perfectQuizzes: 5,
    highAccuracyQuizzes: 18,
    breathingCompleted: 7,
    moodCheckDays: 10,
    mockTestsTaken: 3,
  };

  const makeDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  const history: QuizHistory[] = [
    { date: makeDate(0),  subject: 'Mathematics', score: 10, total: 10, accuracy: 100, wrongQuestionIds: [] },
    { date: makeDate(0),  subject: 'Physics',     score: 8,  total: 10, accuracy: 80,  wrongQuestionIds: [] },
    { date: makeDate(0),  subject: 'Chemistry',   score: 9,  total: 10, accuracy: 90,  wrongQuestionIds: [] },
    { date: makeDate(1),  subject: 'Physics',     score: 7,  total: 10, accuracy: 70,  wrongQuestionIds: [] },
    { date: makeDate(1),  subject: 'Mathematics', score: 9,  total: 10, accuracy: 90,  wrongQuestionIds: [] },
    { date: makeDate(2),  subject: 'Chemistry',   score: 10, total: 10, accuracy: 100, wrongQuestionIds: [] },
    { date: makeDate(3),  subject: 'Physics',     score: 6,  total: 10, accuracy: 60,  wrongQuestionIds: [] },
    { date: makeDate(4),  subject: 'Mathematics', score: 8,  total: 10, accuracy: 80,  wrongQuestionIds: [] },
    { date: makeDate(5),  subject: 'Chemistry',   score: 7,  total: 10, accuracy: 70,  wrongQuestionIds: [] },
    { date: makeDate(6),  subject: 'Physics',     score: 9,  total: 10, accuracy: 90,  wrongQuestionIds: [] },
    { date: makeDate(7),  subject: 'Mathematics', score: 10, total: 10, accuracy: 100, wrongQuestionIds: [] },
    { date: makeDate(8),  subject: 'Chemistry',   score: 8,  total: 10, accuracy: 80,  wrongQuestionIds: [] },
    { date: makeDate(9),  subject: 'Physics',     score: 7,  total: 10, accuracy: 70,  wrongQuestionIds: [] },
    { date: makeDate(10), subject: 'Mathematics', score: 9,  total: 10, accuracy: 90,  wrongQuestionIds: [] },
    { date: makeDate(12), subject: 'Chemistry',   score: 10, total: 10, accuracy: 100, wrongQuestionIds: [] },
  ];

  localStorage.setItem('aceit_game_demo_jee',    JSON.stringify(profile));
  localStorage.setItem('aceit_history_demo_jee', JSON.stringify(history));
}

// Always called on login — resets challenges to zero so they can be tested
export function resetDemoChallenges(): void {
  const daily: DailyState = {
    date: getToday(),
    mood: null,
    jokeRevealed: false,
    quizzesCompleted: 0,
    highAccuracyCount: 0,
    perfectCount: 0,
    breathingCount: 0,
    subjectsStudied: [],
    completedChallengeIds: [],
    dailyChallengeScore: null,
  };

  const weekly: WeeklyState = {
    weekKey: getWeekKey(),
    quizzesCompleted: 0,
    highAccuracyCount: 0,
    subjectsStudied: [],
    completedChallengeIds: [],
  };

  localStorage.setItem('aceit_daily_demo_jee',  JSON.stringify(daily));
  localStorage.setItem('aceit_weekly_demo_jee', JSON.stringify(weekly));
}

export function isDemoProfileSeeded(): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem('aceit_game_demo_jee') ?? '{}');
    return (stored.xp ?? 0) >= 2700;
  } catch {
    return false;
  }
}
