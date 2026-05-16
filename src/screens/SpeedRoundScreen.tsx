import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { QUESTION_BANK } from '../data/questions';
import type { Question } from '../types';

const TOTAL = 10;
const TIME_PER_Q = 8; // seconds
const SPEED_BONUS_PER_Q = 5; // XP per correct answer (on top of base)

function pickQuestions(): Question[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL);
}

type Phase = 'intro' | 'quiz' | 'results';

export default function SpeedRoundScreen() {
  const navigate = useNavigate();
  const { awardXP } = useGame();

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [results, setResults] = useState<{ correct: boolean; timeLeft: number }[]>([]);
  const xpAwarded = useRef(false);

  const advance = useCallback((isCorrect: boolean, remaining: number) => {
    setResults((prev) => [...prev, { correct: isCorrect, timeLeft: remaining }]);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= TOTAL) {
      setPhase('results');
    } else {
      setCurrentIndex(nextIndex);
      setSelected(null);
      setTimeLeft(TIME_PER_Q);
    }
    if (isCorrect) setCorrectCount((c) => c + 1);
  }, [currentIndex]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'quiz' || selected !== null) return;
    if (timeLeft <= 0) {
      advance(false, 0);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, selected, advance]);

  // Award XP once on results
  useEffect(() => {
    if (phase === 'results' && !xpAwarded.current) {
      xpAwarded.current = true;
      const speedBonus = results.filter((r) => r.correct).reduce((s, r) => s + Math.ceil((r.timeLeft / TIME_PER_Q) * SPEED_BONUS_PER_Q), 0);
      const base = correctCount * 10;
      awardXP(base + speedBonus);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function startQuiz() {
    setQuestions(pickQuestions());
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setTimeLeft(TIME_PER_Q);
    setResults([]);
    xpAwarded.current = false;
    setPhase('quiz');
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    const isCorrect = idx === questions[currentIndex].correctIndex;
    setSelected(idx);
    setTimeout(() => advance(isCorrect, timeLeft), 700);
  }

  const accuracy = results.length > 0 ? Math.round((correctCount / TOTAL) * 100) : 0;

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
        <header className="px-5 pt-12 pb-4">
          <button onClick={() => navigate('/arena')} className="text-slate-400 text-sm mb-3">← Back</button>
          <p className="text-[10px] text-yellow-400 font-semibold tracking-widest">⚡ ARENA</p>
          <h1 className="text-2xl font-bold mt-1">Speed Round</h1>
        </header>
        <main className="px-5 flex-1 flex flex-col justify-center space-y-5">
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-700/40 rounded-2xl p-6 text-center">
            <p className="text-6xl mb-4">⚡</p>
            <h2 className="text-xl font-bold mb-2">Pure Reflex Mode</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {TOTAL} questions · {TIME_PER_Q} seconds each · Auto-advance on timeout
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
            {[
              { icon: '⏱', text: `${TIME_PER_Q}s per question — auto-advance on timeout` },
              { icon: '⚡', text: 'Answer faster = more speed bonus XP' },
              { icon: '🎯', text: 'No second chances, no skipping' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={startQuiz}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
          >
            Start Speed Round ⚡
          </button>
        </main>
      </div>
    );
  }

  if (phase === 'results') {
    const speedBonus = results.filter((r) => r.correct).reduce((s, r) => s + Math.ceil((r.timeLeft / TIME_PER_Q) * SPEED_BONUS_PER_Q), 0);
    const baseXP = correctCount * 10;
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
        <header className="px-5 pt-12 pb-6 text-center">
          <p className="text-5xl mb-3">{accuracy >= 80 ? '⚡' : accuracy >= 50 ? '🎯' : '💪'}</p>
          <h1 className="text-2xl font-bold">
            {accuracy >= 80 ? 'Lightning Fast!' : accuracy >= 50 ? 'Not Bad!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Speed Round Complete</p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
            ⚡ +{baseXP + speedBonus} XP earned ({speedBonus > 0 ? `+${speedBonus} speed bonus` : 'no speed bonus'})
          </div>
        </header>
        <main className="px-5 space-y-4">
          <div className="bg-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <p className="text-4xl font-bold">{correctCount}/{TOTAL}</p>
                <p className="text-slate-400 text-xs mt-1">Score</p>
              </div>
              <div className="w-px h-12 bg-slate-700" />
              <div className="text-center flex-1">
                <p className="text-4xl font-bold text-yellow-400">{accuracy}%</p>
                <p className="text-slate-400 text-xs mt-1">Accuracy</p>
              </div>
            </div>
            <div className="flex gap-1">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${r.correct ? 'bg-green-500' : 'bg-red-500/60'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="flex-1 bg-yellow-500 text-slate-900 font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              Play Again ⚡
            </button>
            <button
              onClick={() => navigate('/arena')}
              className="flex-1 border border-slate-600 text-slate-300 py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              Back to Arena
            </button>
          </div>
        </main>
      </div>
    );
  }

  // quiz phase
  const q = questions[currentIndex];
  const timerPct = (timeLeft / TIME_PER_Q) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Timer bar */}
      <div className="h-1.5 bg-slate-700">
        <div
          className={`h-full transition-all duration-1000 linear ${
            timeLeft <= 3 ? 'bg-red-500' : timeLeft <= 5 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{currentIndex + 1}/{TOTAL}</span>
        <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
          {timeLeft}s
        </span>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < results.length ? (results[i].correct ? 'bg-green-500' : 'bg-red-500') :
                i === currentIndex ? 'bg-yellow-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 py-4">
        <div className="bg-slate-800 rounded-2xl p-4 mb-5 flex-1 flex items-center">
          <p className="text-sm leading-relaxed">{q.text}</p>
        </div>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'bg-slate-800 border-slate-700 text-slate-200';
            if (selected !== null) {
              if (i === q.correctIndex) cls = 'bg-green-900/50 border-green-600 text-green-300';
              else if (i === selected) cls = 'bg-red-900/50 border-red-600 text-red-300';
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
