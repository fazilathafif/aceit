import { useState } from 'react';
import TopicMasteryBar from './TopicMasteryBar';

export interface DayTask {
  chapter: string;
  subject: string;
  quizCount: number;
  mastery: number;
}

export interface WeekPlan {
  weekLabel: string;
  days: { dayLabel: string; tasks: DayTask[] }[];
}

interface Props {
  weeks: WeekPlan[];
  onDrill: (chapter: string) => void;
}

export default function StudySchedule({ weeks, onDrill }: Props) {
  const [openWeek, setOpenWeek] = useState(0);

  if (weeks.length === 0) {
    return (
      <p className="text-slate-500 text-xs text-center py-6">
        Set your exam date and complete more quizzes to generate a schedule.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {weeks.map((week, wi) => (
        <div key={week.weekLabel} className="rounded-xl overflow-hidden border border-slate-700/50">
          <button
            onClick={() => setOpenWeek(openWeek === wi ? -1 : wi)}
            className="w-full flex items-center justify-between bg-slate-700/50 px-4 py-3"
          >
            <span className="text-xs font-semibold text-slate-300">{week.weekLabel}</span>
            <span className="text-slate-500 text-xs">{openWeek === wi ? '▲' : '▼'}</span>
          </button>

          {openWeek === wi && (
            <div className="divide-y divide-slate-700/30">
              {week.days.map((day) => (
                <div key={day.dayLabel} className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-indigo-400 mb-2">{day.dayLabel}</p>
                  {day.tasks.length === 0 ? (
                    <p className="text-xs text-slate-600">Rest day — keep your streak alive!</p>
                  ) : (
                    <div className="space-y-3">
                      {day.tasks.map((task) => (
                        <div key={task.chapter} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <TopicMasteryBar chapter={task.chapter} mastery={task.mastery} size="sm" />
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {task.subject} · {task.quizCount} quiz{task.quizCount !== 1 ? 'zes' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => onDrill(task.chapter)}
                            className="text-xs text-primary font-semibold flex-shrink-0 active:scale-95 transition-transform"
                          >
                            Drill →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
