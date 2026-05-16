import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: { subject: string; accuracy: number }[];
}

export default function SubjectRadarChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Quiz across multiple subjects to see radar
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          itemStyle={{ color: '#818cf8', fontSize: 12 }}
          formatter={(v) => [`${v}%`, 'Avg Accuracy']}
        />
        <Radar dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
