import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { MoodState, GameProfile, DailyState, WeeklyState, Badge } from '../types';
import { BADGE_DEFINITIONS, checkBadgeConditions } from '../data/badges';
import { DAILY_CHALLENGES, WEEKLY_CHALLENGES, type ChallengeDefinition } from '../data/challenges';
import { seedDemoProfile, resetDemoChallenges, isDemoProfileSeeded } from '../lib/seedDemo';
import {
  getLevel,
  xpForLevel,
  getStreakPersonality,
  getToday,
  getYesterday,
  getWeekKey,
} from '../lib/gameUtils';

// ─── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: GameProfile = {
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  freezeTokens: 0,
  earnedBadgeIds: [],
  examDate: null,
  totalQuizzes: 0,
  perfectQuizzes: 0,
  highAccuracyQuizzes: 0,
  breathingCompleted: 0,
  moodCheckDays: 0,
  mockTestsTaken: 0,
};

const DEFAULT_DAILY: DailyState = {
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

const DEFAULT_WEEKLY: WeeklyState = {
  weekKey: getWeekKey(),
  quizzesCompleted: 0,
  highAccuracyCount: 0,
  subjectsStudied: [],
  completedChallengeIds: [],
};

// ─── localStorage helpers ──────────────────────────────────────────────────────
const GAME_KEY   = (id: string) => `aceit_game_${id}`;
const DAILY_KEY  = (id: string) => `aceit_daily_${id}`;
const WEEKLY_KEY = (id: string) => `aceit_weekly_${id}`;

function readProfile(userId: string): GameProfile {
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(GAME_KEY(userId)) ?? '{}') };
  } catch { return { ...DEFAULT_PROFILE }; }
}

function readDaily(userId: string): DailyState {
  try {
    const stored: Partial<DailyState> = JSON.parse(localStorage.getItem(DAILY_KEY(userId)) ?? '{}');
    if (stored.date !== getToday()) return { ...DEFAULT_DAILY };
    return { ...DEFAULT_DAILY, ...stored };
  } catch { return { ...DEFAULT_DAILY }; }
}

function readWeekly(userId: string): WeeklyState {
  try {
    const stored: Partial<WeeklyState> = JSON.parse(localStorage.getItem(WEEKLY_KEY(userId)) ?? '{}');
    if (stored.weekKey !== getWeekKey()) return { ...DEFAULT_WEEKLY };
    return { ...DEFAULT_WEEKLY, ...stored };
  } catch { return { ...DEFAULT_WEEKLY }; }
}

// ─── Challenge helpers ─────────────────────────────────────────────────────────
export interface ChallengeProgress {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  target: number;
  progress: number;
  completed: boolean;
}

function getProgress(def: ChallengeDefinition, daily: DailyState, weekly: WeeklyState): number {
  const src = def.type === 'daily' ? daily : weekly;
  const raw = src[def.progressKey as keyof typeof src];
  return Array.isArray(raw) ? raw.length : (raw as number) ?? 0;
}

function buildChallengeProgress(
  defs: ChallengeDefinition[],
  daily: DailyState,
  weekly: WeeklyState,
): ChallengeProgress[] {
  return defs.map((def) => {
    const progress = getProgress(def, daily, weekly);
    const completed = def.type === 'daily'
      ? daily.completedChallengeIds.includes(def.id)
      : weekly.completedChallengeIds.includes(def.id);
    return { ...def, progress, completed };
  });
}

// ─── Context value interface ───────────────────────────────────────────────────
interface GameContextValue {
  profile: GameProfile;
  dailyState: DailyState;
  weeklyState: WeeklyState;
  level: number;
  xpProgress: number;
  xpToNext: number;
  streakPersonality: { label: string; emoji: string };
  daysToExam: number | null;
  earnedBadges: Badge[];
  newlyEarnedBadges: Badge[];
  clearNewBadges: () => void;
  dailyChallenges: ChallengeProgress[];
  weeklyChallenges: ChallengeProgress[];
  awardXP: (amount: number) => void;
  onQuizComplete: (opts: { score: number; total: number; accuracy: number; subject: string }) => void;
  checkInMood: (mood: MoodState) => void;
  setExamDate: (date: string) => void;
  revealJoke: () => void;
  completeBreathing: () => void;
  completeDailyChallenge: (score: number) => void;
  completeMockTest: (totalScore: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function GameProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [profile, setProfile] = useState<GameProfile>(() => {
    if (!userId) return { ...DEFAULT_PROFILE };
    if (userId === 'demo_jee') {
      if (!isDemoProfileSeeded()) seedDemoProfile();
      resetDemoChallenges();
    }
    return readProfile(userId);
  });
  const [dailyState, setDailyState] = useState<DailyState>(() =>
    userId ? readDaily(userId) : { ...DEFAULT_DAILY }
  );
  const [weeklyState, setWeeklyState] = useState<WeeklyState>(() =>
    userId ? readWeekly(userId) : { ...DEFAULT_WEEKLY }
  );
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);

  // Track whether the challenge-claimer useEffect should skip the initial run
  const challengeInitRef = useRef(true);

  useEffect(() => {
    if (userId) {
      if (userId === 'demo_jee') {
        if (!isDemoProfileSeeded()) seedDemoProfile();
        resetDemoChallenges();
      }
      setProfile(readProfile(userId));
      setDailyState(readDaily(userId));
      setWeeklyState(readWeekly(userId));
      challengeInitRef.current = true;
    } else {
      setProfile({ ...DEFAULT_PROFILE });
      setDailyState({ ...DEFAULT_DAILY });
      setWeeklyState({ ...DEFAULT_WEEKLY });
    }
  }, [userId]);

  const saveProfile = useCallback(
    (p: GameProfile) => { if (userId) localStorage.setItem(GAME_KEY(userId), JSON.stringify(p)); },
    [userId]
  );
  const saveDaily = useCallback(
    (d: DailyState) => { if (userId) localStorage.setItem(DAILY_KEY(userId), JSON.stringify(d)); },
    [userId]
  );
  const saveWeekly = useCallback(
    (w: WeeklyState) => { if (userId) localStorage.setItem(WEEKLY_KEY(userId), JSON.stringify(w)); },
    [userId]
  );

  // ─── Derived values ──────────────────────────────────────────────────────────
  const level       = getLevel(profile.xp);
  const xpThisLevel = xpForLevel(level);
  const xpNextLevel = xpForLevel(level + 1);
  const xpToNext    = xpNextLevel - profile.xp;
  const xpProgress  = xpNextLevel > xpThisLevel
    ? Math.round(((profile.xp - xpThisLevel) / (xpNextLevel - xpThisLevel)) * 100)
    : 100;
  const streakPersonality = getStreakPersonality(profile.streak);
  const daysToExam = profile.examDate
    ? Math.max(0, Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / 86400000))
    : null;
  const earnedBadges     = BADGE_DEFINITIONS.filter((b) => profile.earnedBadgeIds.includes(b.id));
  const dailyChallenges  = buildChallengeProgress(DAILY_CHALLENGES, dailyState, weeklyState);
  const weeklyChallenges = buildChallengeProgress(WEEKLY_CHALLENGES, dailyState, weeklyState);

  // ─── Badge check ─────────────────────────────────────────────────────────────
  const checkAndAwardBadges = useCallback((p: GameProfile): GameProfile => {
    const newIds = checkBadgeConditions(p, p.earnedBadgeIds);
    if (newIds.length === 0) return p;
    const fresh = BADGE_DEFINITIONS.filter((b) => newIds.includes(b.id));
    setNewlyEarnedBadges((prev) => [...prev, ...fresh]);
    return { ...p, earnedBadgeIds: [...p.earnedBadgeIds, ...newIds] };
  }, []);

  // ─── Streak update ────────────────────────────────────────────────────────────
  const updateStreak = useCallback((p: GameProfile): GameProfile => {
    const today = getToday();
    if (p.lastActiveDate === today) return p;
    let newStreak = p.streak;
    if (p.lastActiveDate === getYesterday()) {
      newStreak = p.streak + 1;
    } else if (!p.lastActiveDate) {
      newStreak = 1;
    } else {
      const daysMissed = Math.floor(
        (new Date(today).getTime() - new Date(p.lastActiveDate).getTime()) / 86400000
      ) - 1;
      if (p.freezeTokens > 0 && daysMissed <= 1) {
        return { ...p, freezeTokens: p.freezeTokens - 1, lastActiveDate: today };
      }
      newStreak = 1;
    }
    return { ...p, streak: newStreak, lastActiveDate: today };
  }, []);

  // ─── Auto-claim challenges (useEffect watches tracking state) ─────────────────
  useEffect(() => {
    // Skip on initial mount / userId change — state was just loaded from storage
    if (challengeInitRef.current) {
      challengeInitRef.current = false;
      return;
    }

    const newDailyIds = DAILY_CHALLENGES
      .filter((def) =>
        !dailyState.completedChallengeIds.includes(def.id) &&
        getProgress(def, dailyState, weeklyState) >= def.target
      )
      .map((def) => def.id);

    const newWeeklyIds = WEEKLY_CHALLENGES
      .filter((def) =>
        !weeklyState.completedChallengeIds.includes(def.id) &&
        getProgress(def, dailyState, weeklyState) >= def.target
      )
      .map((def) => def.id);

    const dailyXP  = DAILY_CHALLENGES.filter((d) => newDailyIds.includes(d.id)).reduce((s, d) => s + d.xpReward, 0);
    const weeklyXP = WEEKLY_CHALLENGES.filter((d) => newWeeklyIds.includes(d.id)).reduce((s, d) => s + d.xpReward, 0);
    const bonusXP  = dailyXP + weeklyXP;

    if (newDailyIds.length > 0) {
      setDailyState((prev) => {
        const updated = { ...prev, completedChallengeIds: [...prev.completedChallengeIds, ...newDailyIds] };
        saveDaily(updated);
        return updated;
      });
    }
    if (newWeeklyIds.length > 0) {
      setWeeklyState((prev) => {
        const updated = { ...prev, completedChallengeIds: [...prev.completedChallengeIds, ...newWeeklyIds] };
        saveWeekly(updated);
        return updated;
      });
    }
    if (bonusXP > 0) {
      setProfile((prev) => {
        const updated = { ...prev, xp: prev.xp + bonusXP };
        saveProfile(updated);
        return updated;
      });
    }
  }, [dailyState.quizzesCompleted, dailyState.highAccuracyCount, dailyState.perfectCount,
      dailyState.breathingCount, dailyState.subjectsStudied,
      weeklyState.quizzesCompleted, weeklyState.highAccuracyCount, weeklyState.subjectsStudied]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Award XP ─────────────────────────────────────────────────────────────────
  const awardXP = useCallback(
    (amount: number) => {
      setProfile((prev) => {
        const updated = { ...prev, xp: prev.xp + amount };
        saveProfile(updated);
        return updated;
      });
    },
    [saveProfile]
  );

  // ─── Quiz complete ─────────────────────────────────────────────────────────────
  const onQuizComplete = useCallback(
    ({ score, total: _total, accuracy, subject }: { score: number; total: number; accuracy: number; subject: string }) => {
      setDailyState((prev) => {
        const updated: DailyState = {
          ...prev,
          quizzesCompleted: prev.quizzesCompleted + 1,
          highAccuracyCount: accuracy >= 80 ? prev.highAccuracyCount + 1 : prev.highAccuracyCount,
          perfectCount: accuracy === 100 ? prev.perfectCount + 1 : prev.perfectCount,
          subjectsStudied: prev.subjectsStudied.includes(subject)
            ? prev.subjectsStudied : [...prev.subjectsStudied, subject],
        };
        saveDaily(updated);
        return updated;
      });

      setWeeklyState((prev) => {
        const updated: WeeklyState = {
          ...prev,
          quizzesCompleted: prev.quizzesCompleted + 1,
          highAccuracyCount: accuracy >= 80 ? prev.highAccuracyCount + 1 : prev.highAccuracyCount,
          subjectsStudied: prev.subjectsStudied.includes(subject)
            ? prev.subjectsStudied : [...prev.subjectsStudied, subject],
        };
        saveWeekly(updated);
        return updated;
      });

      setProfile((prev) => {
        let p = { ...prev };
        p.xp += 10 + score * 2 + (accuracy === 100 ? 25 : 0);
        p.totalQuizzes += 1;
        if (accuracy === 100) p.perfectQuizzes += 1;
        if (accuracy >= 90) p.highAccuracyQuizzes += 1;
        const before = p.streak;
        p = updateStreak(p);
        if (p.streak !== before && [7, 30, 100].includes(p.streak)) p.xp += 50;
        p = checkAndAwardBadges(p);
        saveProfile(p);
        return p;
      });
    },
    [saveProfile, saveDaily, saveWeekly, updateStreak, checkAndAwardBadges]
  );

  // ─── Mood check-in ────────────────────────────────────────────────────────────
  const checkInMood = useCallback(
    (mood: MoodState) => {
      setDailyState((prev) => {
        const updated = { ...prev, mood };
        saveDaily(updated);
        return updated;
      });
      setProfile((prev) => {
        let p = { ...prev, moodCheckDays: prev.moodCheckDays + 1, xp: prev.xp + 5 };
        p = checkAndAwardBadges(p);
        saveProfile(p);
        return p;
      });
    },
    [saveDaily, saveProfile, checkAndAwardBadges]
  );

  // ─── Set exam date ─────────────────────────────────────────────────────────────
  const setExamDate = useCallback(
    (date: string) => {
      setProfile((prev) => {
        const updated = { ...prev, examDate: date };
        saveProfile(updated);
        return updated;
      });
    },
    [saveProfile]
  );

  // ─── Reveal joke ──────────────────────────────────────────────────────────────
  const revealJoke = useCallback(() => {
    setDailyState((prev) => {
      const updated = { ...prev, jokeRevealed: true };
      saveDaily(updated);
      return updated;
    });
  }, [saveDaily]);

  // ─── Breathing complete ───────────────────────────────────────────────────────
  const completeBreathing = useCallback(() => {
    setDailyState((prev) => {
      const updated = { ...prev, breathingCount: prev.breathingCount + 1 };
      saveDaily(updated);
      return updated;
    });
    setProfile((prev) => {
      let p = { ...prev, breathingCompleted: prev.breathingCompleted + 1, xp: prev.xp + 5 };
      p = checkAndAwardBadges(p);
      saveProfile(p);
      return p;
    });
  }, [saveProfile, saveDaily, checkAndAwardBadges]);

  const clearNewBadges = useCallback(() => setNewlyEarnedBadges([]), []);

  const completeDailyChallenge = useCallback(
    (score: number) => {
      setDailyState((prev) => {
        const updated = { ...prev, dailyChallengeScore: score };
        saveDaily(updated);
        return updated;
      });
      setProfile((prev) => {
        let p = { ...prev, xp: prev.xp + 20 + score * 5 };
        p = checkAndAwardBadges(p);
        saveProfile(p);
        return p;
      });
    },
    [saveDaily, saveProfile, checkAndAwardBadges]
  );

  // ─── Complete mock test ────────────────────────────────────────────────────────
  const completeMockTest = useCallback(
    (totalScore: number) => {
      setProfile((prev) => {
        let p = { ...prev, mockTestsTaken: prev.mockTestsTaken + 1, xp: prev.xp + 50 + Math.max(0, totalScore) };
        p = checkAndAwardBadges(p);
        saveProfile(p);
        return p;
      });
    },
    [saveProfile, checkAndAwardBadges]
  );

  return (
    <GameContext.Provider
      value={{
        profile,
        dailyState,
        weeklyState,
        level,
        xpProgress,
        xpToNext,
        streakPersonality,
        daysToExam,
        earnedBadges,
        newlyEarnedBadges,
        clearNewBadges,
        dailyChallenges,
        weeklyChallenges,
        awardXP,
        onQuizComplete,
        checkInMood,
        setExamDate,
        revealJoke,
        completeBreathing,
        completeDailyChallenge,
        completeMockTest,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
