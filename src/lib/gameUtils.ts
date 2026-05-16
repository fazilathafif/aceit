export const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpForLevel(level: number): number {
  return LEVEL_XP[Math.min(level - 1, LEVEL_XP.length - 1)] ?? LEVEL_XP[LEVEL_XP.length - 1];
}

export function getStreakPersonality(streak: number): { label: string; emoji: string } {
  if (streak >= 90) return { label: 'Exam God', emoji: '🏛️' };
  if (streak >= 60) return { label: 'Legendary Grinder', emoji: '💀' };
  if (streak >= 30) return { label: 'Unstoppable Force', emoji: '🔥' };
  if (streak >= 14) return { label: 'Momentum Machine', emoji: '⚡' };
  if (streak >= 7) return { label: 'Consistent Carl', emoji: '📚' };
  return { label: 'Seedling', emoji: '🌱' };
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function getWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// ─── Analytics helpers ────────────────────────────────────────────────────────
import type { QuizHistory, Subject } from '../types';

export function groupHistoryByWeek(history: QuizHistory[]): { week: string; count: number }[] {
  const map = new Map<string, number>();
  // Build 8-week window ending today
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const start = new Date(year, 0, 1);
    const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    map.set(`W${week}`, 0);
  }
  history.forEach((h) => {
    const d = new Date(h.date);
    const year = d.getFullYear();
    const start = new Date(year, 0, 1);
    const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    const key = `W${week}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([week, count]) => ({ week, count }));
}

export function getSubjectAccuracy(history: QuizHistory[]): { subject: string; accuracy: number }[] {
  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  return subjects.map((subject) => {
    const filtered = history.filter((h) => h.subject === subject);
    const accuracy = filtered.length > 0
      ? Math.round(filtered.reduce((s, h) => s + h.accuracy, 0) / filtered.length)
      : 0;
    return { subject, accuracy };
  }).filter((s) => s.accuracy > 0);
}

export function getAccuracyTrend(history: QuizHistory[]): { date: string; accuracy: number }[] {
  return [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map((h) => ({
      date: new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      accuracy: h.accuracy,
    }));
}
