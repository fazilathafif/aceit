import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { QuizConfig, Question, AnswerRecord, QuizStatus, WeakTopic } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────
interface QuizState {
  config: QuizConfig | null;
  questions: Question[];
  currentIndex: number;
  answers: AnswerRecord[];
  status: QuizStatus;
  selectedIndex: number | null;
  startTime: number; // ms timestamp when current Q started
  quizStartTime: number;
}

const initial: QuizState = {
  config: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  status: 'idle',
  selectedIndex: null,
  startTime: 0,
  quizStartTime: 0,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'START_QUIZ'; config: QuizConfig; questions: Question[] }
  | { type: 'SELECT_ANSWER'; index: number }
  | { type: 'SKIP' }
  | { type: 'NEXT' }
  | { type: 'RESET' };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initial,
        config: action.config,
        questions: action.questions,
        status: 'active',
        startTime: Date.now(),
        quizStartTime: Date.now(),
      };

    case 'SELECT_ANSWER': {
      if (state.status !== 'active') return state;
      const q = state.questions[state.currentIndex];
      const isCorrect = action.index === q.correctIndex;
      const timeSpent = Math.round((Date.now() - state.startTime) / 1000);
      const record: AnswerRecord = {
        questionIndex: state.currentIndex,
        selectedIndex: action.index,
        isCorrect,
        timeSpent,
      };
      return {
        ...state,
        status: 'feedback',
        selectedIndex: action.index,
        answers: [...state.answers, record],
      };
    }

    case 'SKIP': {
      if (state.status !== 'active') return state;
      const timeSpent = Math.round((Date.now() - state.startTime) / 1000);
      const record: AnswerRecord = {
        questionIndex: state.currentIndex,
        selectedIndex: null,
        isCorrect: false,
        timeSpent,
      };
      const next = state.currentIndex + 1;
      return {
        ...state,
        answers: [...state.answers, record],
        currentIndex: next,
        selectedIndex: null,
        status: next >= state.questions.length ? 'complete' : 'active',
        startTime: Date.now(),
      };
    }

    case 'NEXT': {
      if (state.status !== 'feedback') return state;
      const next = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: next,
        selectedIndex: null,
        status: next >= state.questions.length ? 'complete' : 'active',
        startTime: Date.now(),
      };
    }

    case 'RESET':
      return initial;

    default:
      return state;
  }
}

// ─── Derived helpers ──────────────────────────────────────────────────────────
export function computeWeakTopics(
  questions: Question[],
  answers: AnswerRecord[]
): WeakTopic[] {
  const map = new Map<string, { wrong: number; total: number }>();
  answers.forEach((a) => {
    const ch = questions[a.questionIndex]?.chapter ?? 'Unknown';
    const cur = map.get(ch) ?? { wrong: 0, total: 0 };
    map.set(ch, {
      wrong: cur.wrong + (a.isCorrect ? 0 : 1),
      total: cur.total + 1,
    });
  });
  return Array.from(map.entries())
    .map(([chapter, v]) => ({ chapter, ...v }))
    .filter((t) => t.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong);
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface QuizContextValue {
  state: QuizState;
  dispatch: React.Dispatch<Action>;
  weakTopics: WeakTopic[];
  accuracy: number;
  score: number;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const weakTopics = computeWeakTopics(state.questions, state.answers);
  const score = state.answers.filter((a) => a.isCorrect).length;
  const accuracy =
    state.answers.length > 0
      ? Math.round((score / state.answers.length) * 100)
      : 0;

  return (
    <QuizContext.Provider value={{ state, dispatch, weakTopics, accuracy, score }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider');
  return ctx;
}
