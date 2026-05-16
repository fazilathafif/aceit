import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import BottomNav from '../components/BottomNav';

export default function ArenaScreen() {
  const navigate = useNavigate();
  const { dailyState } = useGame();

  const dailyDone = dailyState.dailyChallengeScore !== null;

  const modes = [
    {
      id: 'daily',
      icon: '🎯',
      title: 'Daily Challenge',
      desc: 'Same 10 questions for everyone today. Climb the leaderboard!',
      color: 'from-rose-900/60 to-orange-900/60',
      border: 'border-rose-800/40',
      badge: dailyDone
        ? { label: `Done · ${dailyState.dailyChallengeScore}/10`, cls: 'bg-green-900/50 text-green-300 border-green-700/40' }
        : { label: 'Play', cls: 'bg-rose-900/50 text-rose-300 border-rose-700/40' },
      path: '/daily',
      live: true,
    },
    {
      id: 'speed',
      icon: '⚡',
      title: 'Speed Round',
      desc: '10 questions, 8 seconds each. Pure reflexes + speed bonus XP.',
      color: 'from-yellow-900/60 to-amber-900/60',
      border: 'border-yellow-800/40',
      badge: { label: 'Play', cls: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/40' },
      path: '/speed',
      live: true,
    },
    {
      id: 'duel',
      icon: '⚔️',
      title: '1v1 Duel',
      desc: 'Face AceBot across Easy / Medium / Hard difficulty. Win for big XP.',
      color: 'from-purple-900/60 to-indigo-900/60',
      border: 'border-purple-800/40',
      badge: { label: 'Play', cls: 'bg-purple-900/50 text-purple-300 border-purple-700/40' },
      path: '/duel',
      live: true,
    },
    {
      id: 'royale',
      icon: '💀',
      title: 'Battle Royale',
      desc: '10 players. One wrong answer eliminates you. Last one standing wins.',
      color: 'from-slate-800/60 to-slate-700/60',
      border: 'border-slate-700/40',
      badge: { label: 'Coming Soon', cls: 'bg-slate-700/50 text-slate-400 border-slate-600/40' },
      path: null,
      live: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        <p className="text-slate-400 text-sm">BATTLE ZONE</p>
        <h1 className="text-2xl font-bold mt-1">Arena ⚔️</h1>
        <p className="text-slate-500 text-xs mt-1">Compete, earn XP, climb the ranks</p>
      </header>

      <main className="px-5 space-y-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.path && navigate(mode.path)}
            disabled={!mode.live}
            className={`w-full text-left bg-gradient-to-br ${mode.color} border ${mode.border} rounded-2xl p-4 flex items-start gap-4 transition-transform ${mode.live ? 'active:scale-[0.98] hover:brightness-110' : 'opacity-50 cursor-not-allowed'}`}
          >
            <span className="text-3xl mt-0.5 flex-shrink-0">{mode.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-bold text-sm">{mode.title}</p>
                <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${mode.badge.cls}`}>
                  {mode.badge.label}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-snug">{mode.desc}</p>
            </div>
            {mode.live && <span className="text-slate-500 text-xs mt-0.5 flex-shrink-0">→</span>}
          </button>
        ))}
      </main>

      <BottomNav active="arena" />
    </div>
  );
}
