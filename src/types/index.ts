export type Exam = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
export type ClassLevel = '11' | '12' | 'Both';
export type Subject = 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type QuizMode = 'Practice' | 'Mock' | 'DailyChallenge' | 'FullMock';
export type QuizStatus = 'idle' | 'active' | 'feedback' | 'complete';

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  classLevel: '11' | '12';
}

export interface QuizConfig {
  exam: Exam;
  classLevel: ClassLevel;
  subject: Subject;
  chapters: string[];
  difficulty: Difficulty;
  questionCount: number;
  timerSeconds: number;
  mode: QuizMode;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  chapter: string;
  subject: Subject;
  difficulty: Difficulty;
  classLevel: '11' | '12';
}

export interface AnswerRecord {
  questionIndex: number;
  selectedIndex: number | null; // null = skipped / timed-out
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface WeakTopic {
  chapter: string;
  wrong: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  exam: Exam;
  classLevel: ClassLevel;
  passwordHash: string; // simple base64 encode — not production auth
}

export interface Preferences {
  exam: Exam;
  classLevel: ClassLevel;
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  timerSeconds: number;
  mode: QuizMode;
}

export interface QuizHistory {
  date: string;
  subject: Subject;
  score: number;
  total: number;
  accuracy: number;
  wrongQuestionIds?: string[];
}

// ─── Revision & Spaced Repetition ─────────────────────────────────────────────
export interface RevisionItem {
  questionId: string;
  interval: number;      // days until next review
  easiness: number;      // SM-2 E-factor (default 2.5)
  repetitions: number;   // successful reviews so far
  dueDate: string;       // YYYY-MM-DD
  addedDate: string;     // YYYY-MM-DD
}

export interface Bookmark {
  questionId: string;
  addedAt: string;
}

// ─── Gamification & Wellbeing ─────────────────────────────────────────────────
export type MoodState = 'tired' | 'stressed' | 'neutral' | 'good' | 'energized';

export interface GameProfile {
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezeTokens: number;
  earnedBadgeIds: string[];
  examDate: string | null;
  totalQuizzes: number;
  perfectQuizzes: number;
  highAccuracyQuizzes: number; // 90%+
  breathingCompleted: number;
  moodCheckDays: number;
  mockTestsTaken: number;
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  mood: MoodState | null;
  jokeRevealed: boolean;
  quizzesCompleted: number;
  highAccuracyCount: number;  // ≥80%
  perfectCount: number;       // 100%
  breathingCount: number;
  subjectsStudied: string[];
  completedChallengeIds: string[];
  dailyChallengeScore: number | null; // null = not yet attempted today
}

export interface WeeklyState {
  weekKey: string;             // "YYYY-WW"
  quizzesCompleted: number;
  highAccuracyCount: number;
  subjectsStudied: string[];
  completedChallengeIds: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ─── Full Mock Test ───────────────────────────────────────────────────────────
export interface MockSectionConfig {
  subject: Subject;
  questionCount: number;
  correct: number;   // marks per correct answer
  wrong: number;     // marks deducted per wrong answer (negative value)
}

export interface MockConfig {
  exam: Exam;
  totalMinutes: number;
  sections: MockSectionConfig[];
}

export interface MockResult {
  exam: Exam;
  date: string;
  timeTaken: number; // seconds
  sectionScores: { subject: Subject; score: number; maxScore: number; correct: number; wrong: number; skipped: number }[];
  totalScore: number;
  maxScore: number;
}
