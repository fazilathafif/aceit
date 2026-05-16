interface Props {
  chapter: string;
  mastery: number; // 0-100
  size?: 'sm' | 'md';
}

export default function TopicMasteryBar({ chapter, mastery, size = 'md' }: Props) {
  const color =
    mastery >= 75 ? 'bg-green-500' :
    mastery >= 45 ? 'bg-yellow-500' :
    mastery > 0   ? 'bg-red-500'   : 'bg-slate-600';

  const label =
    mastery >= 75 ? 'Mastered' :
    mastery >= 45 ? 'Learning' :
    mastery > 0   ? 'Struggling' : 'New';

  return (
    <div className={size === 'sm' ? 'space-y-0.5' : 'space-y-1'}>
      <div className="flex justify-between items-center">
        <span className={`font-medium truncate flex-1 ${size === 'sm' ? 'text-[11px] text-slate-300' : 'text-xs text-slate-200'}`}>
          {chapter}
        </span>
        <span className={`ml-2 font-semibold ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${
          mastery >= 75 ? 'text-green-400' : mastery >= 45 ? 'text-yellow-400' : mastery > 0 ? 'text-red-400' : 'text-slate-600'
        }`}>
          {mastery > 0 ? `${mastery}%` : label}
        </span>
      </div>
      <div className={`bg-slate-700 rounded-full overflow-hidden ${size === 'sm' ? 'h-1' : 'h-1.5'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${mastery}%` }}
        />
      </div>
    </div>
  );
}
