import { getToday } from './gameUtils';
import type { RevisionItem } from '../types';

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// grade: 1=forgot, 2=hard (wrong), 3=good (correct with effort), 4=easy, 5=perfect
export function sm2Update(item: RevisionItem, grade: 1 | 2 | 3 | 4 | 5): RevisionItem {
  const today = getToday();

  if (grade < 3) {
    return {
      ...item,
      repetitions: 0,
      interval: 1,
      dueDate: addDays(today, 1),
    };
  }

  const newEasiness = Math.max(
    1.3,
    item.easiness + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  );

  let newInterval: number;
  if (item.repetitions === 0) {
    newInterval = 1;
  } else if (item.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.interval * newEasiness);
  }

  return {
    ...item,
    repetitions: item.repetitions + 1,
    interval: newInterval,
    easiness: newEasiness,
    dueDate: addDays(today, newInterval),
  };
}

export function newRevisionItem(questionId: string): RevisionItem {
  const today = getToday();
  return {
    questionId,
    interval: 1,
    easiness: 2.5,
    repetitions: 0,
    dueDate: today,
    addedDate: today,
  };
}
