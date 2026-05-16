import { QUESTION_BANK } from '../data/questions';
import type { Question } from '../types';

// ─── LCG seeded PRNG ──────────────────────────────────────────────────────────
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  const rand = lcg(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function getDailySeed(): number {
  return getDayOfYear() * 1000 + new Date().getFullYear();
}

export function getDailyQuestions(count = 10): Question[] {
  const seed = getDailySeed();
  const shuffled = seededShuffle(QUESTION_BANK, seed);
  return shuffled.slice(0, count);
}

// ─── Simulated leaderboard ────────────────────────────────────────────────────
const BOTS = [
  { name: 'Arjun S.',   avatar: '🦁' },
  { name: 'Priya K.',   avatar: '🌟' },
  { name: 'Rohan M.',   avatar: '🔥' },
  { name: 'Sneha T.',   avatar: '⚡' },
  { name: 'Vikram P.',  avatar: '🎯' },
  { name: 'Anjali R.',  avatar: '🌸' },
  { name: 'Karan B.',   avatar: '🏆' },
  { name: 'Divya N.',   avatar: '💎' },
];

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  accuracy: number;
  isUser: boolean;
}

export function getDailyLeaderboard(
  userScore: number,
  total: number,
  userName: string,
): LeaderboardEntry[] {
  const seed = getDailySeed();
  const rand = lcg(seed + 99);

  const entries: Omit<LeaderboardEntry, 'rank'>[] = BOTS.map((bot) => {
    const rawScore = Math.floor(rand() * (total + 1));
    return {
      name: bot.name,
      avatar: bot.avatar,
      score: rawScore,
      accuracy: Math.round((rawScore / total) * 100),
      isUser: false,
    };
  });

  entries.push({
    name: userName,
    avatar: '👤',
    score: userScore,
    accuracy: Math.round((userScore / total) * 100),
    isUser: true,
  });

  entries.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
