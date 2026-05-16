import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MockResult } from '../types';
import BottomNav from '../components/BottomNav';

const MOCK_SESSION_KEY = 'aceit_mock_session';

const EXAM_MAX: Record<string, number> = {
  JEE_MAIN: 300,
  JEE_ADVANCED: 240,
  NEET: 720,
};

function estimateRank(pct: number, exam: string): string {
  if (exam === 'NEET') {
    if (pct >= 95) return 'Top 1,000';
    if (pct >= 85) return 'Top 10,000';
    if (pct >= 70) return 'Top 50,000';
    if (pct >= 50) return 'Top 2,00,000';
    return 'Above 5,00,000';
  }
  if (pct >= 95) return 'Top 500';
  if (pct >= 85) return 'Top 5,000';
  if (pct >= 70) return 'Top 20,000';
  if (pct >= 50) return 'Top 80,000';
  return 'Above 2,00,000';
}

export default function MockResultScreen() {
  const navigate = useNavigate();
  const [result, setResult] = useState<MockResult | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MOCK_SESSION_KEY);
      if (stored) setResult(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No mock test result found.</p>
          <button onClick={() => navigate('/mock')} className="text-primary font-medium">Take a mock test →</button>
        </div>
      </div>
    );
  }

  const pct = Math.round((result.totalScore / result.maxScore) * 100);
  const rank = estimateRank(pct, result.exam);
  const timeMins = Math.floor(result.timeTaken / 60);
  const timeSecs = result.timeTaken % 60;
  const examMaxScore = EXAM_MAX[result.exam] ?? result.maxScore;
  const scaledScore = Math.round((result.totalScore / result.maxScore) * examMaxScore);

  const grade =
    pct >= 85 ? { label: 'Outstanding!', emoji: '🏆', color: 'text-yellow-400' } :
    pct >= 70 ? { label: 'Great Work!',   emoji: '⭐', color: 'text-green-400'  } :
    pct >= 50 ? { label: 'Keep Going!',   emoji: '💪', color: 'text-yellow-500' } :
                { label: 'Keep Practicing', emoji: '📚', color: 'text-slate-300' };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-6 text-center">
        <p className="text-5xl mb-2">{grade.emoji}</p>
        <h1 className={`text-2xl font-bold ${grade.color}`}>{grade.label}</h1>
        <p className="text-slate-400 text-sm mt-1">{result.exam.replace('_', ' ')} Full Mock Test</p>
        <div className="inline-flex items-center gap-1.5 mt-3 bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
          ⚡ +{50 + Math.max(0, result.totalScore)} XP earned
        </div>
      </header>

      <main className="px-5 space-y-4">
        {/* Score summary */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-around mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{result.totalScore}</p>
              <p className="text-xs text-slate-400 mt-1">Raw Score</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold">{scaledScore}</p>
              <p className="text-xs text-slate-400 mt-1">/{examMaxScore}</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{pct}%</p>
              <p className="text-xs text-slate-400 mt-1">Accuracy</p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>⏱ {timeMins}m {timeSecs}s taken</span>
            <span>🎯 Est. rank: {rank}</span>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 tracking-widest mb-3">SECTION BREAKDOWN</p>
          <div className="space-y-3">
            {result.sectionScores.map((sec) => {
              const secPct = Math.round((Math.max(0, sec.score) / sec.maxScore) * 100);
              return (
                <div key={sec.subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-200 font-medium">{sec.subject}</span>
                    <span className="text-slate-400 text-xs">
                      {sec.correct}✓ {sec.wrong}✗ {sec.skipped}—
                    </span>
                    <span className={`font-bold text-sm ${sec.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sec.score > 0 ? '+' : ''}{sec.score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${secPct >= 70 ? 'bg-green-500' : secPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${secPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/mock')}
            className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Retake Mock
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex-1 border border-slate-600 text-slate-300 py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            📊 Full Stats
          </button>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full text-slate-500 text-sm py-2"
        >
          ← Back to Home
        </button>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
