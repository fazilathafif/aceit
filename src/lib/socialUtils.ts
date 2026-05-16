// Deterministic seeded RNG (LCG) — same userId always produces same friends/leaderboard
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return h >>> 0;
}

const FIRST_NAMES = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Divya', 'Karan', 'Ananya', 'Rohan', 'Pooja'];
const LAST_NAMES  = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Mehta', 'Nair', 'Reddy', 'Joshi', 'Kumar', 'Iyer'];
const AVATARS     = ['🧑‍🎓', '👩‍🔬', '🧑‍💻', '👨‍🏫', '👩‍🎓', '🧑‍🔬', '👩‍💻', '👨‍🎓', '🧑', '👩'];

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  weeklyXp: number;
  exam: string;
  level: number;
}

export interface LeaderboardEntry extends Friend {
  rank: number;
  isUser: boolean;
}

export interface StudyGroupMember {
  id: string;
  name: string;
  avatar: string;
  completedToday: boolean;
  streak: number;
}

function getLevel(xp: number): number {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getFriends(userId: string, count = 8): Friend[] {
  const rng = lcg(hashStr(userId));
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName  = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const avatar    = AVATARS[Math.floor(rng() * AVATARS.length)];
    const xp        = Math.floor(rng() * 3000) + 100;
    const streak    = Math.floor(rng() * 30);
    const weeklyXp  = Math.floor(rng() * 500) + 20;
    const exam      = rng() > 0.5 ? 'NEET' : 'JEE_MAIN';
    return {
      id: `bot_${i}_${userId}`,
      name: `${firstName} ${lastName}`,
      avatar,
      xp,
      streak,
      weeklyXp,
      exam,
      level: getLevel(xp),
    };
  });
}

export function getWeeklyLeaderboard(
  userWeeklyXp: number,
  userId: string,
  userName: string,
  userXp: number,
  userStreak: number,
  userExam: string
): LeaderboardEntry[] {
  const friends = getFriends(userId);
  const userEntry: LeaderboardEntry = {
    id: userId,
    name: userName,
    avatar: '😊',
    xp: userXp,
    streak: userStreak,
    weeklyXp: userWeeklyXp,
    exam: userExam,
    level: getLevel(userXp),
    rank: 0,
    isUser: true,
  };
  const entries: LeaderboardEntry[] = [
    userEntry,
    ...friends.map((f) => ({ ...f, rank: 0, isUser: false })),
  ]
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .map((e, i) => ({ ...e, rank: i + 1 }));
  return entries;
}

export function getStudyGroup(userId: string): StudyGroupMember[] {
  const rng = lcg(hashStr(userId + 'group'));
  // Date seed so completion status "progresses" daily
  const today = new Date().toISOString().split('T')[0];
  const dateSeed = hashStr(today);
  const completeRng = lcg(dateSeed ^ hashStr(userId));

  return Array.from({ length: 4 }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName  = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const avatar    = AVATARS[Math.floor(rng() * AVATARS.length)];
    const streak    = Math.floor(rng() * 20);
    const completedToday = completeRng() > 0.35;
    return {
      id: `grp_${i}_${userId}`,
      name: `${firstName} ${lastName}`,
      avatar,
      completedToday,
      streak,
    };
  });
}

export function computeWeeklyXp(history: { date: string; accuracy: number }[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return history
    .filter((h) => new Date(h.date) >= cutoff)
    .reduce((sum) => sum + 30, 0); // approx 30 XP per quiz
}
