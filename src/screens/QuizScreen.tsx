import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useRevision } from '../context/RevisionContext';
import { useTimer } from '../hooks/useTimer';
import AITutor from '../components/AITutor';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const { toggleBookmark, isBookmarked } = useRevision();
  const { questions, currentIndex, status, selectedIndex, config } = state;
  const [tutorOpen, setTutorOpen] = useState(false);

  const q = questions[currentIndex];
  const total = questions.length;
  const timerOn = (config?.timerSeconds ?? 0) > 0;

  const handleExpire = useCallback(() => {
    if (status === 'active') dispatch({ type: 'SKIP' });
  }, [status, dispatch]);

  const { timeLeft, pct, urgent, stop, reset } = useTimer(
    config?.timerSeconds ?? 90,
    handleExpire,
    timerOn && status === 'active'
  );

  // Reset timer on new question
  useEffect(() => {
    if (status === 'active') reset();
  }, [currentIndex, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop timer when answer selected
  useEffect(() => {
    if (status === 'feedback') stop();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no quiz loaded
  useEffect(() => {
    if (!q) navigate('/setup');
  }, [q, navigate]);

  if (!q || !config) return null;

  const progress = ((currentIndex + 1) / total) * 100;

  function handleSelect(idx: number) {
    if (status !== 'active') return;
    dispatch({ type: 'SELECT_ANSWER', index: idx });
  }

  function optionStyle(idx: number) {
    const base =
      'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ';
    if (status !== 'feedback') {
      return base + 'border-slate-700 bg-slate-800 hover:border-indigo-400 cursor-pointer';
    }
    if (idx === q.correctIndex) {
      return base + 'border-success bg-success/10 text-success cursor-default';
    }
    if (idx === selectedIndex && !q.correctIndex) {
      return base + 'border-danger bg-danger/10 text-danger cursor-default';
    }
    if (idx === selectedIndex) {
      return base + 'border-danger bg-danger/10 text-danger cursor-default';
    }
    return base + 'border-slate-700 bg-slate-800 opacity-50 cursor-default';
  }

  const isMock = config.mode === 'Mock';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">
            Q {currentIndex + 1} / {total} · {config.subject}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleBookmark(q.id)}
              className={`text-xl transition-colors ${isBookmarked(q.id) ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
              aria-label="Bookmark question"
            >
              🔖
            </button>
            <button
              onClick={() => {
                if (window.confirm('Quit quiz?')) {
                  dispatch({ type: 'RESET' });
                  navigate('/');
                }
              }}
              className="text-slate-500 text-sm hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-5 space-y-4 overflow-y-auto pb-4">
        {/* Timer */}
        {timerOn && status === 'active' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  urgent ? 'bg-accent' : 'bg-primary'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`font-mono text-sm font-bold w-10 text-right ${
                urgent ? 'text-accent' : 'text-slate-300'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        )}

        {/* Difficulty badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              q.difficulty === 'Easy'
                ? 'bg-green-900/50 text-green-400'
                : q.difficulty === 'Hard'
                ? 'bg-red-900/50 text-red-400'
                : 'bg-yellow-900/50 text-yellow-400'
            }`}
          >
            {q.difficulty}
          </span>
          <span className="text-xs text-slate-500">{q.chapter}</span>
        </div>

        {/* Question */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-base font-medium leading-relaxed">{q.text}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={optionStyle(idx)}
              disabled={status === 'feedback'}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  status === 'feedback' && idx === q.correctIndex
                    ? 'bg-success text-white'
                    : status === 'feedback' && idx === selectedIndex && idx !== q.correctIndex
                    ? 'bg-danger text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {OPTION_LETTERS[idx]}
              </span>
              <span className="text-sm">{opt}</span>
              {status === 'feedback' && idx === q.correctIndex && (
                <span className="ml-auto text-success">✓</span>
              )}
              {status === 'feedback' && idx === selectedIndex && idx !== q.correctIndex && (
                <span className="ml-auto text-danger">✗</span>
              )}
            </button>
          ))}
        </div>

        {/* Feedback section */}
        {status === 'feedback' && (
          <div className="space-y-3">
            {/* Result banner */}
            <div
              className={`rounded-2xl p-3 flex items-center gap-3 ${
                selectedIndex === q.correctIndex
                  ? 'bg-success/10 border border-success/30'
                  : selectedIndex === null
                  ? 'bg-slate-700/50 border border-slate-600'
                  : 'bg-danger/10 border border-danger/30'
              }`}
            >
              <span className="text-2xl">
                {selectedIndex === q.correctIndex
                  ? '✅'
                  : selectedIndex === null
                  ? '⏭'
                  : '❌'}
              </span>
              <p className="font-semibold text-sm">
                {selectedIndex === q.correctIndex
                  ? 'Correct!'
                  : selectedIndex === null
                  ? 'Timed out — skipped'
                  : `Incorrect · Correct: ${OPTION_LETTERS[q.correctIndex]}`}
              </p>
            </div>

            {/* Explanation (hidden in mock mode) */}
            {!isMock && (
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 mb-1.5">💡 Explanation</p>
                <p className="text-sm text-slate-200 leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className="px-5 pb-8 pt-3 flex gap-3">
        {status === 'active' && (
          <>
            <button
              onClick={() => dispatch({ type: 'SKIP' })}
              className="flex-1 border border-slate-600 text-slate-400 py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
            >
              Skip
            </button>
            <button
              onClick={() => setTutorOpen(true)}
              className="border border-slate-600 text-slate-400 px-4 py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              🚩
            </button>
          </>
        )}
        {status === 'feedback' && (
          <>
            {!isMock && (
              <button
                onClick={() => setTutorOpen(true)}
                className="flex-1 border border-indigo-500 text-indigo-400 py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
              >
                🤖 Ask AI Tutor
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              className="flex-1 bg-primary text-white py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
            >
              {currentIndex + 1 >= total ? 'See Results →' : 'Next →'}
            </button>
          </>
        )}
        {status === 'complete' && (
          <button
            onClick={() => navigate('/results')}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            See Results →
          </button>
        )}
      </footer>

      {tutorOpen && (
        <AITutor
          topic={q.chapter}
          wrongQuestions={[q]}
          onClose={() => setTutorOpen(false)}
        />
      )}
    </div>
  );
}
