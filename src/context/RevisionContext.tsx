import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { RevisionItem } from '../types';
import { sm2Update, newRevisionItem } from '../lib/sm2';
import { getToday } from '../lib/gameUtils';
import { QUESTION_BANK } from '../data/questions';
import { api } from '../lib/api';

// ─── Question lookup map (built once) ─────────────────────────────────────────
const Q_MAP = new Map(QUESTION_BANK.map((q) => [q.id, q]));

// ─── Storage keys ──────────────────────────────────────────────────────────────
const QUEUE_KEY    = (id: string) => `aceit_revq_${id}`;
const BOOK_KEY     = (id: string) => `aceit_book_${id}`;
const ERROR_KEY    = (id: string) => `aceit_errs_${id}`;

function readJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

// ─── Chapter stats derived from queue ─────────────────────────────────────────
export interface ChapterStat {
  chapter: string;
  subject: string;
  total: number;
  mastered: number;   // interval >= 21
  learning: number;   // interval 7-20
  struggling: number; // interval < 7
}

export function computeChapterStats(queue: RevisionItem[]): Map<string, ChapterStat> {
  const map = new Map<string, ChapterStat>();
  for (const item of queue) {
    const q = Q_MAP.get(item.questionId);
    if (!q) continue;
    const key = q.chapter;
    const existing = map.get(key) ?? { chapter: q.chapter, subject: q.subject, total: 0, mastered: 0, learning: 0, struggling: 0 };
    existing.total += 1;
    if (item.interval >= 21) existing.mastered += 1;
    else if (item.interval >= 7) existing.learning += 1;
    else existing.struggling += 1;
    map.set(key, existing);
  }
  return map;
}

// ─── Context value ────────────────────────────────────────────────────────────
interface RevisionContextValue {
  queue: RevisionItem[];
  dueToday: RevisionItem[];
  dueCount: number;
  addToQueue: (questionIds: string[]) => void;
  reviewItem: (questionId: string, grade: 1 | 2 | 3 | 4 | 5) => void;
  removeFromQueue: (questionId: string) => void;

  bookmarks: string[];
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;

  errorNotebook: string[];
  addToErrorNotebook: (questionIds: string[]) => void;
  removeFromErrorNotebook: (questionId: string) => void;

  chapterStats: Map<string, ChapterStat>;
}

const RevisionContext = createContext<RevisionContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RevisionProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [queue, setQueue]               = useState<RevisionItem[]>(() => userId ? readJSON(QUEUE_KEY(userId), []) : []);
  const [bookmarks, setBookmarks]       = useState<string[]>(() => userId ? readJSON(BOOK_KEY(userId), []) : []);
  const [errorNotebook, setErrorNotebook] = useState<string[]>(() => userId ? readJSON(ERROR_KEY(userId), []) : []);

  useEffect(() => {
    if (userId) {
      setQueue(readJSON(QUEUE_KEY(userId), []));
      setBookmarks(readJSON(BOOK_KEY(userId), []));
      setErrorNotebook(readJSON(ERROR_KEY(userId), []));
    } else {
      setQueue([]); setBookmarks([]); setErrorNotebook([]);
    }
  }, [userId]);

  const saveQueue = useCallback((q: RevisionItem[]) => {
    if (!userId) return;
    localStorage.setItem(QUEUE_KEY(userId), JSON.stringify(q));
    if (!userId.startsWith('demo_')) {
      api.put('/api/revision/queue', q).catch(() => {});
    }
  }, [userId]);
  const saveBookmarks = useCallback((b: string[]) => {
    if (!userId) return;
    localStorage.setItem(BOOK_KEY(userId), JSON.stringify(b));
  }, [userId]);
  const saveErrors = useCallback((e: string[]) => {
    if (!userId) return;
    localStorage.setItem(ERROR_KEY(userId), JSON.stringify(e));
  }, [userId]);

  const today = getToday();
  const dueToday = useMemo(() => queue.filter((i) => i.dueDate <= today), [queue, today]);
  const dueCount = dueToday.length;
  const chapterStats = useMemo(() => computeChapterStats(queue), [queue]);

  // ─── Queue management ──────────────────────────────────────────────────────
  const addToQueue = useCallback((questionIds: string[]) => {
    setQueue((prev) => {
      const existingIds = new Set(prev.map((i) => i.questionId));
      const newItems = questionIds
        .filter((id) => !existingIds.has(id) && Q_MAP.has(id))
        .map(newRevisionItem);
      if (newItems.length === 0) return prev;
      const updated = [...prev, ...newItems];
      saveQueue(updated);
      return updated;
    });
  }, [saveQueue]);

  const reviewItem = useCallback((questionId: string, grade: 1 | 2 | 3 | 4 | 5) => {
    setQueue((prev) => {
      const updated = prev.map((item) =>
        item.questionId === questionId ? sm2Update(item, grade) : item
      );
      saveQueue(updated);
      return updated;
    });
  }, [saveQueue]);

  const removeFromQueue = useCallback((questionId: string) => {
    setQueue((prev) => {
      const updated = prev.filter((i) => i.questionId !== questionId);
      saveQueue(updated);
      return updated;
    });
  }, [saveQueue]);

  // ─── Bookmarks ─────────────────────────────────────────────────────────────
  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      saveBookmarks(updated);
      return updated;
    });
  }, [saveBookmarks]);

  const isBookmarked = useCallback((questionId: string) => bookmarks.includes(questionId), [bookmarks]);

  // ─── Error notebook ────────────────────────────────────────────────────────
  const addToErrorNotebook = useCallback((questionIds: string[]) => {
    setErrorNotebook((prev) => {
      const updated = [...new Set([...prev, ...questionIds])];
      saveErrors(updated);
      return updated;
    });
  }, [saveErrors]);

  const removeFromErrorNotebook = useCallback((questionId: string) => {
    setErrorNotebook((prev) => {
      const updated = prev.filter((id) => id !== questionId);
      saveErrors(updated);
      return updated;
    });
  }, [saveErrors]);

  return (
    <RevisionContext.Provider value={{
      queue, dueToday, dueCount, addToQueue, reviewItem, removeFromQueue,
      bookmarks, toggleBookmark, isBookmarked,
      errorNotebook, addToErrorNotebook, removeFromErrorNotebook,
      chapterStats,
    }}>
      {children}
    </RevisionContext.Provider>
  );
}

export function useRevision() {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error('useRevision must be used inside RevisionProvider');
  return ctx;
}
