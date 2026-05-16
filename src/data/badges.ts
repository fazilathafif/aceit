import type { Badge, GameProfile } from '../types';
import { getLevel } from '../lib/gameUtils';

export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first_quiz',   name: 'First Step',         description: 'Complete your first quiz',             icon: '🎯' },
  { id: 'streak_7',     name: 'Week Warrior',        description: '7-day study streak',                   icon: '🔥' },
  { id: 'streak_30',    name: 'Monthly Legend',      description: '30-day study streak',                  icon: '🏆' },
  { id: 'perfect_1',    name: 'Sharpshooter',        description: 'Score 100% on a quiz',                 icon: '💯' },
  { id: 'perfect_3',    name: 'Hat Trick',           description: 'Score 100% on 3 quizzes',              icon: '🎩' },
  { id: 'quiz_10',      name: 'Warmed Up',           description: 'Complete 10 quizzes',                  icon: '📚' },
  { id: 'quiz_25',      name: 'Dedicated',           description: 'Complete 25 quizzes',                  icon: '🎓' },
  { id: 'breathe_5',    name: 'Mindful Moment',      description: 'Complete 5 breathing exercises',       icon: '🫁' },
  { id: 'mood_7',       name: 'Self-Aware',          description: 'Check in mood for 7 days',             icon: '🧘' },
  { id: 'level_5',      name: 'Rising Star',         description: 'Reach Level 5',                        icon: '⭐' },
  { id: 'accuracy_90',  name: 'Precision Machine',   description: 'Get 90%+ accuracy 5 times',            icon: '⚡' },
  { id: 'early_bird',   name: 'Early Bird',          description: 'Complete a quiz before 8am',           icon: '🌅' },
  { id: 'night_owl',    name: 'Night Owl',           description: 'Complete a quiz after 11pm',           icon: '🦉' },
];

export function checkBadgeConditions(profile: GameProfile, alreadyEarned: string[]): string[] {
  const newBadges: string[] = [];
  const add = (id: string) => {
    if (!alreadyEarned.includes(id) && !newBadges.includes(id)) newBadges.push(id);
  };

  const hour = new Date().getHours();
  const level = getLevel(profile.xp);

  if (profile.totalQuizzes >= 1)          add('first_quiz');
  if (profile.streak >= 7)                add('streak_7');
  if (profile.streak >= 30)               add('streak_30');
  if (profile.perfectQuizzes >= 1)        add('perfect_1');
  if (profile.perfectQuizzes >= 3)        add('perfect_3');
  if (profile.totalQuizzes >= 10)         add('quiz_10');
  if (profile.totalQuizzes >= 25)         add('quiz_25');
  if (profile.breathingCompleted >= 5)    add('breathe_5');
  if (profile.moodCheckDays >= 7)         add('mood_7');
  if (level >= 5)                         add('level_5');
  if (profile.highAccuracyQuizzes >= 5)   add('accuracy_90');
  if (hour < 8 && profile.totalQuizzes >= 1)  add('early_bird');
  if (hour >= 23 && profile.totalQuizzes >= 1) add('night_owl');

  return newBadges;
}
