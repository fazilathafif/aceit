import type { QuizHistory } from '../types';

interface Props {
  history: QuizHistory[];
}

function getColor(accuracy: number | null): string {
  if (accuracy === null) return 'bg-slate-800';
  if (accuracy >= 85) return 'bg-green-500';
  if (accuracy >= 70) return 'bg-green-700';
  if (accuracy >= 50) return 'bg-yellow-600';
  return 'bg-red-700';
}

export default function ActivityHeatmap({ history }: Props) {
  // Build a map of date → avg accuracy
  const dateMap = new Map<string, { total: number; count: number }>();
  for (const h of history) {
    const d = h.date.split('T')[0];
    const cur = dateMap.get(d) ?? { total: 0, count: 0 };
    dateMap.set(d, { total: cur.total + h.accuracy, count: cur.count + 1 });
  }

  // Generate last 84 days (12 weeks), oldest first
  const days: { date: string; accuracy: number | null }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = dateMap.get(key);
    days.push({
      date: key,
      accuracy: entry ? Math.round(entry.total / entry.count) : null,
    });
  }

  // Pad front so week starts on Monday
  const firstDay = new Date(days[0].date).getDay(); // 0=Sun
  const padDays = firstDay === 0 ? 6 : firstDay - 1;
  const padded = [...Array(padDays).fill(null), ...days];

  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7) as (typeof days[0] | null)[]);
  }

  const activeDays = days.filter((d) => d.accuracy !== null).length;
  const avgAcc =
    activeDays > 0
      ? Math.round(days.filter((d) => d.accuracy !== null).reduce((s, d) => s + d.accuracy!, 0) / activeDays)
      : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Last 12 weeks</p>
        {avgAcc !== null && (
          <p className="text-xs text-slate-400">
            {activeDays} active days · avg <span className="text-white font-semibold">{avgAcc}%</span>
          </p>
        )}
      </div>

      {/* Day-of-week labels */}
      <div className="flex gap-1 mb-1 ml-0">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="w-[10px] text-[8px] text-slate-600 text-center">{d}</div>
        ))}
      </div>

      {/* Grid — columns = weeks, rows = days */}
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}${day.accuracy !== null ? ` · ${day.accuracy}%` : ' · no activity'}` : ''}
                className={`w-[10px] h-[10px] rounded-[2px] ${day === null ? 'bg-transparent' : getColor(day.accuracy)}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-slate-600">Less</span>
        {[null, 40, 60, 75, 90].map((v, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(v)}`} />
        ))}
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </div>
  );
}
