import { useNavigate } from 'react-router-dom';
import type { ChapterStat } from '../context/RevisionContext';

interface Props {
  chapterStats: Map<string, ChapterStat>;
  subject: string;
  onDrillChapter: (chapter: string) => void;
}

function masteryColor(stat: ChapterStat): string {
  if (stat.total === 0) return 'bg-slate-700 text-slate-400';
  const pct = stat.mastered / stat.total;
  if (pct >= 0.8) return 'bg-green-900/70 text-green-300 border border-green-700/50';
  if (pct >= 0.5) return 'bg-yellow-900/70 text-yellow-300 border border-yellow-700/50';
  if (stat.struggling > stat.mastered) return 'bg-red-900/70 text-red-300 border border-red-700/50';
  return 'bg-slate-700 text-slate-300';
}

function masteryLabel(stat: ChapterStat): string {
  if (stat.total === 0) return '';
  const pct = Math.round((stat.mastered / stat.total) * 100);
  return `${pct}%`;
}

export default function ChapterMasteryMap({ chapterStats, subject, onDrillChapter }: Props) {
  const subjectChapters = Array.from(chapterStats.values()).filter(
    (s) => s.subject === subject
  );

  if (subjectChapters.length === 0) {
    return (
      <p className="text-slate-600 text-xs text-center py-3">
        Complete some quizzes in {subject} to see chapter mastery.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {subjectChapters.map((stat) => (
        <button
          key={stat.chapter}
          onClick={() => onDrillChapter(stat.chapter)}
          className={`rounded-xl p-2.5 text-left active:scale-95 transition-all ${masteryColor(stat)}`}
        >
          <p className="text-[11px] font-medium leading-snug line-clamp-2">{stat.chapter}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] opacity-70">{stat.total} in queue</span>
            {stat.total > 0 && (
              <span className="text-[10px] font-bold">{masteryLabel(stat)}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
