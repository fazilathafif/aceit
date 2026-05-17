import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useRevision } from '../context/RevisionContext';
import { useMode } from '../context/ModeContext';
import BreathingExercise from '../components/BreathingExercise';
import BottomNav from '../components/BottomNav';
import type { Subject } from '../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, level, xpProgress, daysToExam, setExamDate } = useGame();
  const { dueCount } = useRevision();
  const { can } = useMode();

  const [breathingOpen, setBreathingOpen] = useState(false);
  const [examInput, setExamInput] = useState('');
  const [showExamPicker, setShowExamPicker] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const firstName = user.name.split(' ')[0];

  const subjects: Subject[] = user.exam === 'NEET'
    ? ['Physics', 'Chemistry', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];

  function startSmartQuiz() {
    navigate('/setup');
  }


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="px-5 pt-12 pb-6">
        <p className="text-slate-400 text-sm">{getGreeting()}</p>
        <h1 className="text-3xl font-bold mt-0.5">{firstName} 👋</h1>

        {/* Stat pills row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="bg-orange-900/50 text-orange-300 border border-orange-800/40 px-2.5 py-1 rounded-full text-xs font-semibold">
            🔥 {profile.streak}d streak
          </span>
          <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 px-2.5 py-1 rounded-full text-xs font-semibold">
            ⚡ Lv {level}
          </span>
          {daysToExam !== null ? (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              daysToExam <= 30
                ? 'bg-red-900/50 text-red-300 border-red-800/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              ⏳ {daysToExam}d left
            </span>
          ) : (
            <button
              onClick={() => setShowExamPicker((v) => !v)}
              className="bg-slate-800 text-slate-500 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-medium hover:text-slate-300 transition-colors"
            >
              + Set exam date
            </button>
          )}
        </div>

        {/* Exam date picker */}
        {showExamPicker && (
          <div className="flex gap-2 mt-3">
            <input
              type="date"
              value={examInput}
              onChange={(e) => setExamInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2"
            />
            <button
              onClick={() => { if (examInput) { setExamDate(examInput); setShowExamPicker(false); } }}
              className="bg-primary text-white text-xs font-bold px-4 rounded-xl active:scale-95 transition-transform"
            >
              Save
            </button>
          </div>
        )}

        {/* XP bar */}
        {can('gamification') && (
          <div className="mt-4">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{profile.xp} XP</p>
          </div>
        )}
      </header>

      <main className="px-5 space-y-4">

        {/* ── Revision due banner ──────────────────────────────────── */}
        {dueCount > 0 && (
          <button
            onClick={() => navigate('/flashcards')}
            className="w-full flex items-center justify-between bg-orange-900/30 border border-orange-700/50 rounded-2xl px-4 py-3 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🧠</span>
              <p className="text-sm font-semibold text-orange-300">
                {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
              </p>
            </div>
            <span className="text-orange-400 text-sm font-bold">→</span>
          </button>
        )}

        {/* ── 2×2 Main tiles ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Quiz tile */}
          <button
            onClick={startSmartQuiz}
            className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col justify-between min-h-[130px]"
          >
            <span className="text-3xl">⚡</span>
            <div>
              <p className="font-bold text-sm mt-3">Quiz</p>
              <p className="text-indigo-300 text-[11px] mt-0.5">Custom · Adaptive</p>
            </div>
          </button>

          {/* Review tile */}
          <button
            onClick={() => navigate('/flashcards')}
            className="bg-slate-800 rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col justify-between min-h-[130px] relative overflow-hidden"
          >
            {dueCount > 0 && (
              <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {dueCount}
              </span>
            )}
            <span className="text-3xl">🧠</span>
            <div>
              <p className="font-bold text-sm mt-3">Review</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {dueCount > 0 ? `${dueCount} due today` : 'Flashcards'}
              </p>
            </div>
          </button>

          {/* Study Path tile */}
          <button
            onClick={() => navigate('/studypath')}
            className="bg-slate-800 rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col justify-between min-h-[130px]"
          >
            <span className="text-3xl">🗺️</span>
            <div>
              <p className="font-bold text-sm mt-3">Study Path</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {daysToExam !== null ? `${daysToExam}d schedule` : 'Personalised'}
              </p>
            </div>
          </button>

          {/* Arena tile — hidden in Focus mode */}
          {can('arena') ? (
            <button
              onClick={() => navigate('/arena')}
              className="bg-slate-800 rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col justify-between min-h-[130px]"
            >
              <span className="text-3xl">⚔️</span>
              <div>
                <p className="font-bold text-sm mt-3">Arena</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Challenges · Speed</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/stats')}
              className="bg-slate-800 rounded-2xl p-5 text-left active:scale-95 transition-transform flex flex-col justify-between min-h-[130px]"
            >
              <span className="text-3xl">📊</span>
              <div>
                <p className="font-bold text-sm mt-3">Stats</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Progress · Trends</p>
              </div>
            </button>
          )}
        </div>

        {/* ── Secondary strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Formulas', icon: '📐', path: '/concepts' },
            { label: 'Mock Test', icon: '📝', path: '/mock'     },
            { label: 'Wellbeing', icon: '🫁', action: () => setBreathingOpen(true) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action ?? (() => navigate(item.path!))}
              className="bg-slate-800 rounded-2xl py-3 px-2 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Quick drill (subject row) ────────────────────────────── */}
        <div className="flex gap-2">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => navigate('/setup', { state: { preSubject: sub } })}
              className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl py-2 text-center active:scale-95 transition-transform"
            >
              <p className="text-xs text-slate-400">{sub.slice(0, 4)}</p>
            </button>
          ))}
        </div>

      </main>

      <BottomNav active="home" />

      {breathingOpen && <BreathingExercise onClose={() => setBreathingOpen(false)} />}
    </div>
  );
}
