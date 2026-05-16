import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { week: string; count: number }[];
}

export default function WeeklyQuizBar({ data }: Props) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        No quiz data for the last 8 weeks
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#94a3b8', fontSize: 11 }}
          itemStyle={{ color: '#f97316', fontSize: 12 }}
          formatter={(v) => [v, 'Quizzes']}
        />
        <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
