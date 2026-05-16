import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { QUESTION_BANK } from '../data/questions';
import type { Question } from '../types';

const TOTAL = 10;

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Phase = 'select' | 'quiz' | 'results';

const BOT_ACCURACY: Record<Difficulty, [number, number]> = {
  Easy:   [0.45, 0.60],
  Medium: [0.65, 0.80],
  Hard:   [0.80, 0.95],
};

const BOT_NAMES: Record<Difficulty, { name: string; avatar: string; taunt: string }> = {
  Easy:   { name: 'AceBot Jr.',    avatar: '🤖', taunt: "I'm just warming up!" },
  Medium: { name: 'AceBot',        avatar: '🦾', taunt: "Let's see what you've got." },
  Hard:   { name: 'AceBot Ultra',  avatar: '🧠', taunt: "Few can defeat me. Are you ready?" },
};

function pickQuestions(): Question[] {
  return [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, TOTAL);
}

function simulateBotScore(difficulty: Difficulty): number {
  const [lo, hi] = BOT_ACCURACY[difficulty];
  let score = 0;
  for (let i = 0; i < TOTAL; i++) {
    if (Math.random() < lo + Math.random() * (hi - lo)) score++;
  }
  return score;
}

export default function DuelScreen() {
  const navigate = useNavigate();
  const { awardXP } = useGame();

  const [phase, setPhase] = useState<Phase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const xpAwarded = useRef(false);

  const bot = BOT_NAMES[difficulty];

  const advance = useCallback((isCorrect: boolean) => {
    setAnswers((prev) => [...prev, isCorrect]);
    if (isCorrect) setUserScore((s) => s + 1);
    const next = currentIndex + 1;
    if (next >= TOTAL) {
      setPhase('results');
    } else {
      setCurrentIndex(next);
      setSelected(null);
    }
  }, [currentIndex]);

  function startDuel() {
    const qs = pickQuestions();
    const bs = simulateBotScore(difficulty);
    setQuestions(qs);
    setBotScore(bs);
    setCurrentIndex(0);
    setSelected(null);
    setUserScore(0);
    setAnswers([]);
    xpAwarded.current = false;
    setPhase('quiz');
  }

  useEffect(() => {
    if (phase === 'results' && !xpAwarded.current) {
      xpAwarded.current = true;
      const won = userScore > botScore;
      const xp = userScore * 8 + (won ? 50 : 10);
      awardXP(xp);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(idx: number) {
    if (selected !== null) return;
    const isCorrect = idx === questions[currentIndex].correctIndex;
    setSelected(idx);
    setTimeout(() => advance(isCorrect), 800);
  }

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
        <header className="px-5 pt-12 pb-4">
          <button onClick={() => navigate('/arena')} className="text-slate-400 text-sm mb-3">← Back</button>
          <p className="text-[10px] text-purple-400 font-semibold tracking-widest">⚔️ ARENA</p>
          <h1 className="text-2xl font-bold mt-1">1v1 Duel</h1>
        </header>
        <main className="px-5 flex-1 flex flex-col space-y-4">
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-700/40 rounded-2xl p-5 text-center">
            <p className="text-5xl mb-2">{bot.avatar}</p>
            <p className="font-bold text-lg">{bot.name}</p>
            <p className="text-slate-400 text-sm mt-0.5 italic">"{bot.taunt}"</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-semibold tracking-widest mb-2">CHOOSE DIFFICULTY</p>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
                    difficulty === d
                      ? d === 'Easy'   ? 'bg-green-700/50 border-green-600 text-green-300'
                      : d === 'Medium' ? 'bg-yellow-700/50 border-yellow-600 text-yellow-300'
                      :                  'bg-red-700/50 border-red-600 text-red-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {difficulty === 'Easy'   ? 'Bot accuracy: ~50%' :
               difficulty === 'Medium' ? 'Bot accuracy: ~72%' :
                                         'Bot accuracy: ~88%'}
            </p>
          </div>

          <button
            onClick={startDuel}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-all mt-auto"
          >
            Start Duel ⚔️
          </button>
        </main>
      </div>
    );
  }

  if (phase === 'results') {
    const won = userScore > botScore;
    const tied = userScore === botScore;
    const xp = userScore * 8 + (won ? 50 : 10);
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
        <header className="px-5 pt-12 pb-6 text-center">
          <p className="text-5xl mb-3">{won ? '🏆' : tied ? '🤝' : '😤'}</p>
          <h1 className="text-2xl font-bold">
            {won ? 'Victory!' : tied ? 'Draw!' : 'Defeated!'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">vs {bot.name}</p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
            ⚡ +{xp} XP earned{won ? ' (victory bonus!)' : ''}
          </div>
        </header>
        <main className="px-5 space-y-4">
          {/* Score comparison */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-3xl mb-1">👤</p>
                <p className="text-3xl font-bold">{userScore}</p>
                <p className="text-xs text-slate-400 mt-1">You</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${won ? 'text-green-400' : tied ? 'text-slate-400' : 'text-red-400'}`}>
                  {won ? 'WIN' : tied ? 'DRAW' : 'LOSS'}
                </p>
                <p className="text-xs text-slate-600 mt-1">vs</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">{bot.avatar}</p>
                <p className="text-3xl font-bold">{botScore}</p>
                <p className="text-xs text-slate-400 mt-1">{bot.name}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {answers.map((correct, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${correct ? 'bg-green-500' : 'bg-red-500/60'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPhase('select')}
              className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              Rematch ⚔️
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
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">{currentIndex + 1}/{TOTAL}</span>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>You <span className="text-green-400">{userScore}</span></span>
            <span className="text-slate-600">vs</span>
            <span>{bot.avatar} <span className="text-slate-400">?</span></span>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i < answers.length ? (answers[i] ? 'bg-green-500' : 'bg-red-500') :
                i === currentIndex ? 'bg-purple-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 py-3">
        <div className="bg-slate-800 rounded-2xl p-4 mb-4 flex-1 flex items-center">
          <p className="text-sm leading-relaxed">{q.text}</p>
        </div>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'bg-slate-800 border-slate-700 text-slate-200';
            if (selected !== null) {
              if (i === q.correctIndex) cls = 'bg-green-900/50 border-green-600 text-green-300';
              else if (i === selected && i !== q.correctIndex) cls = 'bg-red-900/50 border-red-600 text-red-300';
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
