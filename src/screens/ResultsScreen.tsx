import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useRevision } from '../context/RevisionContext';
import { getStudyPlan } from '../lib/claude';
import AITutor from '../components/AITutor';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const { state, weakTopics, accuracy, score } = useQuiz();
  const { addHistory } = useAuth();
  const { onQuizComplete, completeDailyChallenge } = useGame();
  const { addToQueue, addToErrorNotebook } = useRevision();
  const { questions, answers, config } = state;
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!config) navigate('/');
  }, [config, navigate]);

  // Save quiz to history and award XP once
  useEffect(() => {
    if (!config || savedRef.current || answers.length === 0) return;
    savedRef.current = true;
    const wrongIds = questions
      .filter((_, i) => !answers[i]?.isCorrect)
      .map((q) => q.id);
    addHistory({
      date: new Date().toISOString(),
      subject: config.subject,
      score,
      total: questions.length,
      accuracy,
      wrongQuestionIds: wrongIds,
    });
    if (wrongIds.length > 0) {
      addToQueue(wrongIds);
      addToErrorNotebook(wrongIds);
    }
    const earned = 10 + score * 2 + (accuracy === 100 ? 25 : 0);
    setXpEarned(earned);
    onQuizComplete({ score, total: questions.length, accuracy, subject: config.subject });
    if (config.mode === 'DailyChallenge') {
      completeDailyChallenge(score);
    }
  }, [config, answers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `I scored ${score}/${questions.length} (${accuracy}%) in ${config!.subject} on AceIt! ${
      accuracy === 100 ? '💯 Perfect score!' : accuracy >= 80 ? '🎯 Great performance!' : '📚 Keep grinding!'
    }`;
    if (navigator.share) {
      await navigator.share({ title: 'AceIt Result', text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!config) return null;

  const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const avgTime = answers.length > 0 ? Math.round(totalTime / answers.length) : 0;
  const skipped = answers.filter((a) => a.selectedIndex === null).length;

  async function handleStudyPlan() {
    if (studyPlan) return;
    setLoadingPlan(true);
    try {
      const plan = await getStudyPlan(weakTopics, answers, config!);
      setStudyPlan(plan);
    } finally {
      setLoadingPlan(false);
    }
  }

  const grade =
    accuracy >= 90
      ? { label: 'Excellent!', color: 'text-success', emoji: '🏆' }
      : accuracy >= 70
      ? { label: 'Good Job!', color: 'text-primary', emoji: '⭐' }
      : accuracy >= 50
      ? { label: 'Keep Going!', color: 'text-yellow-400', emoji: '💪' }
      : { label: 'Keep Practicing', color: 'text-accent', emoji: '📚' };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 text-center">
        <p className="text-4xl mb-2">{grade.emoji}</p>
        <h1 className={`text-2xl font-bold ${grade.color}`}>{grade.label}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {config.subject} · {config.exam.replace('_', ' ')}
        </p>
        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-3 bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
            ⚡ +{xpEarned} XP earned
          </div>
        )}
        {accuracy === 100 && (
          <p className="text-sm text-yellow-300 mt-2 font-medium">
            🎉 Perfect score! The questions are scared of you now.
          </p>
        )}
      </header>

      <main className="px-5 space-y-4">
        {/* Score card */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-4xl font-bold">{score}/{questions.length}</p>
              <p className="text-slate-400 text-xs mt-1">Score</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center flex-1">
              <p className="text-4xl font-bold text-primary">{accuracy}%</p>
              <p className="text-slate-400 text-xs mt-1">Accuracy</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center flex-1">
              <p className="text-4xl font-bold">{avgTime}s</p>
              <p className="text-slate-400 text-xs mt-1">Avg time</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            label="Correct"
            value={score}
            color="text-success"
            bg="bg-success/10"
            icon="✅"
          />
          <StatChip
            label="Wrong"
            value={answers.filter((a) => a.selectedIndex !== null && !a.isCorrect).length}
            color="text-danger"
            bg="bg-danger/10"
            icon="❌"
          />
          <StatChip
            label="Skipped"
            value={skipped}
            color="text-slate-400"
            bg="bg-slate-700/50"
            icon="⏭"
          />
        </div>

        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold mb-3">📍 Weak Areas</h2>
            <div className="space-y-2.5">
              {weakTopics.map((t) => (
                <div key={t.chapter}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-200">{t.chapter}</span>
                    <span className="text-danger text-xs font-semibold">
                      {t.wrong}/{t.total} wrong
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full"
                      style={{ width: `${(t.wrong / t.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Study Plan */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🤖 AI Study Plan</h2>
            {!studyPlan && (
              <button
                onClick={handleStudyPlan}
                disabled={loadingPlan}
                className="text-xs text-primary font-medium disabled:opacity-50"
              >
                {loadingPlan ? 'Generating…' : 'Get Plan'}
              </button>
            )}
          </div>
          {studyPlan ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {studyPlan}
            </p>
          ) : (
            <button
              onClick={handleStudyPlan}
              disabled={loadingPlan}
              className="w-full border border-dashed border-slate-600 rounded-xl py-3 text-sm text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {loadingPlan ? 'Generating personalised plan…' : 'Tap to generate your study plan'}
            </button>
          )}
        </div>

        {/* Review answers toggle */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setReviewOpen((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold"
          >
            <span>📋 Review Answers</span>
            <span className="text-slate-400">{reviewOpen ? '▲' : '▼'}</span>
          </button>
          {reviewOpen && (
            <div className="divide-y divide-slate-700">
              {questions.map((q, i) => {
                const a = answers[i];
                const isCorrect = a?.isCorrect;
                const skipped = a?.selectedIndex === null;
                return (
                  <div key={q.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">
                        {isCorrect ? '✅' : skipped ? '⏭' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-slate-300 leading-snug">{q.text}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {skipped
                            ? 'Skipped'
                            : isCorrect
                            ? `Correct: ${q.options[q.correctIndex]}`
                            : `You: ${q.options[a.selectedIndex!]} · Correct: ${q.options[q.correctIndex]}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/setup')}
            className="flex-1 border border-slate-600 text-slate-300 py-3.5 rounded-2xl text-sm font-semibold active:scale-95 transition-transform"
          >
            Try Again
          </button>
          <button
            onClick={() => setTutorOpen(true)}
            className="flex-1 bg-primary text-white py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
          >
            🤖 AI Tutor
          </button>
        </div>

        {config.mode === 'DailyChallenge' && (
          <button
            onClick={() => navigate('/daily')}
            className="w-full bg-rose-700/40 border border-rose-700/50 text-rose-300 py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-transform"
          >
            🎯 View Leaderboard
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex-1 border border-orange-700/50 text-orange-400 py-3 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
          >
            🧠 Review Revision Queue
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex-1 border border-slate-600 text-slate-400 py-3 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
          >
            📊 Full Stats
          </button>
        </div>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 border border-slate-600 text-slate-300 py-3 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
        >
          {copied ? '✅ Copied to clipboard!' : '📤 Share Result'}
        </button>

        <button
          onClick={() => {
            navigate('/');
          }}
          className="w-full text-slate-500 text-sm py-2"
        >
          ← Back to Home
        </button>
      </main>

      {tutorOpen && (
        <AITutor
          topic={weakTopics[0]?.chapter ?? config.subject}
          wrongQuestions={questions.filter((_, i) => !answers[i]?.isCorrect)}
          onClose={() => setTutorOpen(false)}
        />
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-3 text-center`}>
      <p className="text-lg">{icon}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
