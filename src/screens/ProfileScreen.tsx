import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { BADGE_DEFINITIONS } from '../data/badges';
import ModeSelector from '../components/ModeSelector';
import BottomNav from '../components/BottomNav';
const EXAM_LABELS: Record<string, string> = {
  NEET: 'NEET',
  JEE_MAIN: 'JEE Main',
  JEE_ADVANCED: 'JEE Advanced',
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics: '🔭',
  Chemistry: '⚗️',
  Biology: '🧬',
  Mathematics: '📐',
};

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, preferences, isDemo, erasePreferences, clearHistory, logout, getHistory } = useAuth();
  const { profile, level, xpProgress, xpToNext, streakPersonality, earnedBadges } = useGame();
  const [confirmErase, setConfirmErase] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [history, setHistory] = useState(() => getHistory());

  if (!user) {
    navigate('/login');
    return null;
  }

  const totalQuizzes = history.length;
  const bestAccuracy =
    history.length > 0 ? Math.max(...history.map((h) => h.accuracy)) : null;
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / history.length)
      : null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleErase() {
    if (!confirmErase) { setConfirmErase(true); return; }
    erasePreferences();
    setConfirmErase(false);
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return; }
    clearHistory();
    setHistory([]);
    setConfirmReset(false);
  }

  function handleSignOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold">My Profile</h1>
      </header>

      <main className="px-5 space-y-4">
        {/* User card + XP */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-lg leading-tight">{user.name}</p>
                {isDemo && (
                  <span className="text-xs bg-amber-900/50 text-amber-400 border border-amber-700/50 px-2 py-0.5 rounded-full">Demo</span>
                )}
              </div>
              <p className="text-slate-400 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  {EXAM_LABELS[user.exam]}
                </span>
                <span className="text-xs text-slate-500">Class {user.classLevel}</span>
              </div>
            </div>
          </div>

          {/* Level + XP bar */}
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Level {level}</span>
            <span className="text-xs text-slate-500">{xpToNext} XP to next level</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{profile.xp} XP total</p>
        </div>

        {/* Streak personality */}
        <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-4xl">{streakPersonality.emoji}</div>
          <div className="flex-1">
            <p className="font-semibold">{streakPersonality.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {profile.streak} day streak · {profile.freezeTokens} freeze token{profile.freezeTokens !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">{profile.streak}</p>
            <p className="text-slate-500 text-xs">days</p>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🏅 Badges</h2>
            <span className="text-xs text-slate-500">{earnedBadges.length}/{BADGE_DEFINITIONS.length} earned</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGE_DEFINITIONS.map((b) => {
              const earned = profile.earnedBadgeIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  title={earned ? b.description : `🔒 ${b.description}`}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all ${
                    earned
                      ? 'bg-indigo-900/40 border border-indigo-700/40'
                      : 'bg-slate-700/30 opacity-40'
                  }`}
                >
                  <span className="text-2xl">{earned ? b.icon : '🔒'}</span>
                  <p className="text-[10px] text-center leading-tight text-slate-400">{b.name}</p>
                </div>
              );
            })}
          </div>
          {earnedBadges.length === 0 && (
            <p className="text-slate-600 text-xs text-center mt-3">
              Complete quizzes and check-ins to unlock badges.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Quizzes" value={totalQuizzes.toString()} icon="📝" />
          <StatCard label="Best" value={bestAccuracy !== null ? `${bestAccuracy}%` : '—'} icon="🏆" />
          <StatCard label="Avg" value={avgAccuracy !== null ? `${avgAccuracy}%` : '—'} icon="📊" />
        </div>

        {/* Saved Preferences */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">⚙️ Saved Preferences</h2>
            {preferences && (
              <button onClick={() => navigate('/setup')} className="text-xs text-primary font-medium">
                Edit →
              </button>
            )}
          </div>
          {preferences ? (
            <div className="space-y-2">
              <PrefRow label="Exam" value={EXAM_LABELS[preferences.exam] ?? preferences.exam} />
              <PrefRow label="Subject" value={`${SUBJECT_ICONS[preferences.subject] ?? ''} ${preferences.subject}`} />
              <PrefRow label="Class" value={`Class ${preferences.classLevel}`} />
              <PrefRow label="Difficulty" value={preferences.difficulty} />
              <PrefRow label="Questions" value={`${preferences.questionCount} questions`} />
              <PrefRow label="Timer" value={preferences.timerSeconds === 0 ? 'Off' : `${preferences.timerSeconds}s`} />
              <PrefRow label="Mode" value={preferences.mode} />
              <div className="pt-2">
                {confirmErase ? (
                  <div className="bg-danger/10 border border-danger/30 rounded-xl p-3">
                    <p className="text-xs text-danger mb-2">This will erase all saved quiz preferences. Are you sure?</p>
                    <div className="flex gap-2">
                      <button onClick={handleErase} className="flex-1 bg-danger text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-transform">Yes, erase</button>
                      <button onClick={() => setConfirmErase(false)} className="flex-1 border border-slate-600 text-slate-400 text-xs py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleErase} className="w-full border border-dashed border-danger/40 text-danger/80 text-xs py-2.5 rounded-xl hover:border-danger hover:text-danger transition-colors">
                    🗑 Erase Preferences
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No preferences saved yet.</p>
              <button onClick={() => navigate('/setup')} className="mt-3 text-primary text-sm font-medium">Start a quiz →</button>
            </div>
          )}
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">📋 Recent Quizzes</h2>
              {!confirmReset ? (
                <button onClick={handleReset} className="text-xs text-danger/70 hover:text-danger font-medium transition-colors">Reset scores</button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sure?</span>
                  <button onClick={handleReset} className="text-xs text-danger font-bold">Yes, clear</button>
                  <button onClick={() => setConfirmReset(false)} className="text-xs text-slate-400">Cancel</button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-700 last:border-0">
                  <div>
                    <span className="mr-1.5">{SUBJECT_ICONS[h.subject] ?? '📚'}</span>
                    <span className="text-slate-200">{h.subject}</span>
                    <span className="text-slate-500 text-xs ml-2">
                      {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${h.accuracy >= 70 ? 'text-success' : h.accuracy >= 50 ? 'text-yellow-400' : 'text-danger'}`}>
                      {h.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-1.5">{h.score}/{h.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App Mode */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <ModeSelector />
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full border border-slate-700 text-slate-400 py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform hover:border-danger hover:text-danger"
        >
          Sign Out
        </button>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-800 rounded-2xl p-3 text-center">
      <p className="text-lg">{icon}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
