import { useMode, type AppMode } from '../context/ModeContext';

const MODES: { id: AppMode; icon: string; label: string; tagline: string; color: string; activeColor: string }[] = [
  {
    id: 'focus',
    icon: '🎯',
    label: 'Focus',
    tagline: 'Pure study. No distractions.',
    color: 'border-slate-700 bg-slate-800/50',
    activeColor: 'border-blue-600 bg-blue-900/30',
  },
  {
    id: 'balanced',
    icon: '⚡',
    label: 'Balanced',
    tagline: 'Study + gamification + wellbeing.',
    color: 'border-slate-700 bg-slate-800/50',
    activeColor: 'border-indigo-600 bg-indigo-900/30',
  },
  {
    id: 'compete',
    icon: '🏆',
    label: 'Compete',
    tagline: 'Full arena, social & leaderboards.',
    color: 'border-slate-700 bg-slate-800/50',
    activeColor: 'border-rose-600 bg-rose-900/30',
  },
];

export default function ModeSelector() {
  const { mode, setMode } = useMode();

  return (
    <div>
      <p className="text-xs text-slate-400 font-semibold tracking-widest mb-2">APP MODE</p>
      <div className="space-y-2">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors ${active ? m.activeColor : m.color}`}
            >
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{m.label}</p>
                <p className="text-xs text-slate-500">{m.tagline}</p>
              </div>
              {active && <span className="text-xs text-indigo-400 font-bold">Active</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
