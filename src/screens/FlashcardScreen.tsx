import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevision } from '../context/RevisionContext';
import { QUESTION_BANK } from '../data/questions';
import type { Question } from '../types';

const Q_MAP = new Map(QUESTION_BANK.map((q) => [q.id, q]));

const RATINGS: { label: string; emoji: string; grade: 1 | 2 | 3 | 4 | 5; color: string }[] = [
  { label: 'Forgot',  emoji: '😕', grade: 1, color: 'bg-red-900/50 border border-red-700 text-red-300'     },
  { label: 'Hard',    emoji: '😐', grade: 2, color: 'bg-orange-900/50 border border-orange-700 text-orange-300' },
  { label: 'Good',    emoji: '🙂', grade: 4, color: 'bg-blue-900/50 border border-blue-700 text-blue-300'   },
  { label: 'Easy',    emoji: '😄', grade: 5, color: 'bg-green-900/50 border border-green-700 text-green-300'},
];

export default function FlashcardScreen() {
  const navigate = useNavigate();
  const { dueToday, reviewItem, bookmarks, toggleBookmark } = useRevision();
  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    if (dueToday.length === 0) {
      setDone(true);
      return;
    }
    setSessionQueue(dueToday.map((i) => i.questionId));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRate(grade: 1 | 2 | 3 | 4 | 5) {
    const qid = sessionQueue[currentIdx];
    reviewItem(qid, grade);
    setReviewed((r) => r + 1);
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 >= sessionQueue.length) {
        setDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 200);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center px-6 max-w-lg mx-auto text-center">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
        <p className="text-slate-400 text-sm mb-1">You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''}.</p>
        {dueToday.length === 0 && reviewed === 0 && (
          <p className="text-slate-500 text-sm mt-2">No cards due today — come back tomorrow.</p>
        )}
        <div className="flex flex-col gap-3 w-full mt-8">
          <button
            onClick={() => navigate('/stats')}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform"
          >
            View Stats
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-slate-700 text-slate-400 py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const qid = sessionQueue[currentIdx];
  const question: Question | undefined = Q_MAP.get(qid);

  if (!question) return null;

  const bookmarked = bookmarks.includes(qid);
  const progress = ((currentIdx) / sessionQueue.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white text-xl">←</button>
          <span className="text-sm text-slate-400 font-medium">
            {currentIdx + 1} / {sessionQueue.length} due today
          </span>
          <button
            onClick={() => toggleBookmark(qid)}
            className={`text-xl ${bookmarked ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            🔖
          </button>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-5 flex flex-col justify-between pb-8">
        {/* Card */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Card flip container */}
          <div
            className="relative cursor-pointer select-none"
            style={{ perspective: '1000px', minHeight: '280px' }}
            onClick={() => !flipped && setFlipped(true)}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                minHeight: '280px',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      question.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400'
                      : question.difficulty === 'Hard' ? 'bg-red-900/50 text-red-400'
                      : 'bg-yellow-900/50 text-yellow-400'
                    }`}>{question.difficulty}</span>
                    <span className="text-xs text-slate-500">{question.chapter}</span>
                  </div>
                  <p className="text-base font-medium leading-relaxed">{question.text}</p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-slate-600 text-sm">Tap to reveal answer</span>
                  <span className="text-slate-600">→</span>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div>
                  <p className="text-xs text-success font-semibold mb-2">✓ Correct Answer</p>
                  <p className="text-base font-bold text-success mb-3">
                    {question.options[question.correctIndex]}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-500 text-center mb-1">The question was:</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{question.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating buttons (shown after flip) */}
        {flipped && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 text-center mb-2">How did you do?</p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.grade}
                  onClick={() => handleRate(r.grade)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium active:scale-95 transition-all ${r.color}`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!flipped && (
          <button
            onClick={() => setFlipped(true)}
            className="mt-4 w-full bg-primary text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
          >
            Reveal Answer →
          </button>
        )}
      </main>
    </div>
  );
}
