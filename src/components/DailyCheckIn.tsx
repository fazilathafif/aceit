import type { MoodState } from '../types';
import { useGame } from '../context/GameContext';

const MOODS: { value: MoodState; emoji: string; label: string; hint: string }[] = [
  { value: 'tired',     emoji: '😴', label: 'Tired',     hint: '5 easy questions tonight' },
  { value: 'stressed',  emoji: '😤', label: 'Stressed',  hint: 'Quick flashcard revision only' },
  { value: 'neutral',   emoji: '😐', label: 'Neutral',   hint: 'Regular practice session' },
  { value: 'good',      emoji: '🙂', label: 'Good',      hint: 'Push into harder topics' },
  { value: 'energized', emoji: '🔥', label: 'Energized', hint: 'Full mock or timed drill' },
];

export default function DailyCheckIn() {
  const { checkInMood } = useGame();

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌤️</span>
        <div>
          <p className="text-sm font-semibold text-white">How are you feeling today?</p>
          <p className="text-xs text-slate-500">Your answer shapes today's study suggestion  •  +5 XP</p>
        </div>
      </div>
      <div className="flex justify-between gap-1">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => checkInMood(m.value)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <span className="text-2xl leading-none">{m.emoji}</span>
            <span className="text-[10px] text-slate-400">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MoodSuggestion({ mood }: { mood: MoodState }) {
  const found = MOODS.find((m) => m.value === mood);
  if (!found) return null;
  return (
    <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2">
      <span>{found.emoji}</span>
      <p className="text-xs text-slate-300">
        <span className="text-slate-400">Today's vibe: </span>
        <span className="font-medium">{found.hint}</span>
      </p>
    </div>
  );
}
