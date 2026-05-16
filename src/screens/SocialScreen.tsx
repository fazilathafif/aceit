import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { getWeeklyLeaderboard, getStudyGroup, computeWeeklyXp } from '../lib/socialUtils';
import RankCard from '../components/RankCard';
import BottomNav from '../components/BottomNav';

export default function SocialScreen() {
  const navigate = useNavigate();
  const { user, getHistory } = useAuth();
  const { profile, level } = useGame();
  const [tab, setTab] = useState<'leaderboard' | 'group' | 'rankcard'>('leaderboard');

  if (!user) { navigate('/login'); return null; }

  const history = getHistory();
  const weeklyXp = computeWeeklyXp(history);

  const leaderboard = getWeeklyLeaderboard(
    weeklyXp, user.id, user.name, profile.xp, profile.streak, user.exam
  );
  const studyGroup = getStudyGroup(user.id);
  const userRank = leaderboard.find((e) => e.isUser)?.rank ?? 1;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        <p className="text-slate-400 text-sm">COMPETE MODE</p>
        <h1 className="text-2xl font-bold mt-1">Social 👥</h1>
      </header>

      {/* Tab bar */}
      <div className="px-5 mb-5">
        <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
          {(['leaderboard', 'group', 'rankcard'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'leaderboard' ? '🏆 Board' : t === 'group' ? '👫 Group' : '🎖️ Card'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 space-y-3">

        {/* ── Leaderboard ────────────────────────────────────────────── */}
        {tab === 'leaderboard' && (
          <>
            <div className="bg-slate-800/50 rounded-2xl px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-slate-400">Weekly XP · last 7 days</p>
              <p className="text-xs font-semibold text-indigo-300">Your XP: +{weeklyXp}</p>
            </div>
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  entry.isUser
                    ? 'bg-indigo-900/40 border border-indigo-700/50'
                    : 'bg-slate-800'
                }`}
              >
                <span className={`text-sm font-black w-6 text-center ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-slate-300' :
                  entry.rank === 3 ? 'text-orange-400' : 'text-slate-600'
                }`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {entry.name}{entry.isUser ? ' (you)' : ''}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Lv {entry.level} · 🔥 {entry.streak}d
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-300">+{entry.weeklyXp}</p>
                  <p className="text-[10px] text-slate-600">XP</p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-600 text-center pt-1">
              Leaderboard resets every Monday · simulated friends
            </p>
          </>
        )}

        {/* ── Study Group ────────────────────────────────────────────── */}
        {tab === 'group' && (
          <>
            <div className="bg-slate-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold mb-1">Today's Challenge Completion</h2>
              <p className="text-xs text-slate-500 mb-4">Daily challenge · refreshes at midnight</p>
              <div className="space-y-3">
                {/* User row */}
                <div className="flex items-center gap-3">
                  <span className="text-xl">😊</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{user.name} (you)</p>
                    <p className="text-[10px] text-slate-500">🔥 {profile.streak}d streak</p>
                  </div>
                  <span className="text-green-400 text-xs font-semibold">✓ Done</span>
                </div>
                {studyGroup.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-xl">{m.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">{m.name}</p>
                      <p className="text-[10px] text-slate-500">🔥 {m.streak}d streak</p>
                    </div>
                    <span className={`text-xs font-semibold ${m.completedToday ? 'text-green-400' : 'text-slate-600'}`}>
                      {m.completedToday ? '✓ Done' : '○ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold mb-2">Group Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Completed today', value: `${studyGroup.filter((m) => m.completedToday).length + 1}/5`, icon: '✅' },
                  { label: 'Avg streak', value: `${Math.round((studyGroup.reduce((s, m) => s + m.streak, profile.streak)) / 5)}d`, icon: '🔥' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-lg">{s.icon}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-3">Simulated group — challenges sync daily</p>
            </div>
          </>
        )}

        {/* ── Rank Card ──────────────────────────────────────────────── */}
        {tab === 'rankcard' && (
          <RankCard
            name={user.name}
            exam={user.exam}
            level={level}
            streak={profile.streak}
            xp={profile.xp}
            weeklyXp={weeklyXp}
            rank={userRank}
            totalUsers={leaderboard.length}
          />
        )}

      </main>

      <BottomNav active="social" />
    </div>
  );
}
