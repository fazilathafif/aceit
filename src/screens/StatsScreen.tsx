import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useRevision } from '../context/RevisionContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getQuestionsForConfig } from '../data/questions';
import { getChapters } from '../data/syllabus';
import { groupHistoryByWeek, getSubjectAccuracy, getAccuracyTrend } from '../lib/gameUtils';
import ActivityHeatmap from '../components/ActivityHeatmap';
import ChapterMasteryMap from '../components/ChapterMasteryMap';
import AccuracyTrendChart from '../components/charts/AccuracyTrendChart';
import SubjectRadarChart from '../components/charts/SubjectRadarChart';
import WeeklyQuizBar from '../components/charts/WeeklyQuizBar';
import BottomNav from '../components/BottomNav';
import type { QuizConfig, Subject } from '../types';
import { useQuiz } from '../context/QuizContext';

const SUBJECT_ICONS: Record<string, string> = {
  Physics: '🔭', Chemistry: '⚗️', Biology: '🧬', Mathematics: '📐',
};

// ─── Predicted Score ──────────────────────────────────────────────────────────
function predictScore(exam: string, avgAccuracy: number): { predicted: number; low: number; high: number; max: number } {
  const acc = avgAccuracy / 100;
  if (exam === 'NEET') {
    const attempted = 180 * 0.75;
    const correct = attempted * acc;
    const wrong = attempted * (1 - acc);
    const predicted = Math.round(correct * 4 - wrong);
    return { predicted: Math.max(0, predicted), low: Math.max(0, Math.round(predicted * 0.88)), high: Math.min(720, Math.round(predicted * 1.12)), max: 720 };
  }
  // JEE Main: 300 marks (90 Qs × 4 each - wrong × 1)
  const attempted = 90 * 0.75;
  const correct = attempted * acc;
  const wrong = attempted * (1 - acc);
  const predicted = Math.round(correct * 4 - wrong);
  return { predicted: Math.max(0, predicted), low: Math.max(0, Math.round(predicted * 0.88)), high: Math.min(300, Math.round(predicted * 1.12)), max: 300 };
}

// ─── Simple bar chart (pure CSS) ─────────────────────────────────────────────
function AccuracyBar({ label, accuracy, count, icon }: { label: string; accuracy: number | null; count: number; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-6">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <span className="text-xs text-slate-500">{count} quiz{count !== 1 ? 'zes' : ''}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              accuracy === null ? '' : accuracy >= 75 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: accuracy !== null ? `${accuracy}%` : '0%' }}
          />
        </div>
      </div>
      <span className={`text-sm font-bold w-10 text-right ${
        accuracy === null ? 'text-slate-600' : accuracy >= 75 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {accuracy !== null ? `${accuracy}%` : '—'}
      </span>
    </div>
  );
}

export default function StatsScreen() {
  const navigate = useNavigate();
  const { dispatch } = useQuiz();
  const { user, getHistory } = useAuth();
  const { profile, level, daysToExam } = useGame();
  const { queue, dueCount, errorNotebook, bookmarks, chapterStats } = useRevision();
  const { isPremium } = useSubscription();

  const history = getHistory();
  const [activeSubjectTab, setActiveSubjectTab] = useState(0);
  const [mainTab, setMainTab] = useState<'overview' | 'trends'>('overview');

  const trendAccuracy = getAccuracyTrend(history);
  const subjectRadarData = getSubjectAccuracy(history);
  const weeklyData = groupHistoryByWeek(history);

  if (!user) { navigate('/login'); return null; }

  const subjects: Subject[] = user.exam === 'NEET'
    ? ['Physics', 'Chemistry', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];

  // Per-subject accuracy
  const subjectStats = subjects.map((sub) => {
    const hs = history.filter((h) => h.subject === sub);
    const avg = hs.length > 0 ? Math.round(hs.reduce((s, h) => s + h.accuracy, 0) / hs.length) : null;
    return { subject: sub, accuracy: avg, count: hs.length };
  });

  const overallAccuracy = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / history.length)
    : null;

  const prediction = overallAccuracy !== null ? predictScore(user.exam, overallAccuracy) : null;

  // Drill a chapter directly from mastery map
  function drillChapter(chapter: string) {
    const classLevel = user!.classLevel;
    const subject = subjects[activeSubjectTab];
    const chapters = getChapters(user!.exam, subject, classLevel === 'Both' ? 'Both' : classLevel);
    const chapterNames = chapters.map((c) => c.name);
    const config: QuizConfig = {
      exam: user!.exam, classLevel, subject,
      chapters: chapterNames.includes(chapter) ? [chapter] : chapterNames,
      difficulty: 'Mixed', questionCount: 10, timerSeconds: 0, mode: 'Practice',
    };
    const questions = getQuestionsForConfig(subject, config.chapters, 'Mixed', 10);
    if (questions.length === 0) return;
    dispatch({ type: 'START_QUIZ', config, questions });
    navigate('/quiz');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        <p className="text-slate-400 text-sm">YOUR PROGRESS</p>
        <div className="flex items-center justify-between mt-1 mb-0">
          <h1 className="text-2xl font-bold">Stats 📊</h1>
          <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
            {(['overview', 'trends'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMainTab(t)}
                className={`px-3 py-1 rounded-[10px] text-[11px] font-semibold transition-colors capitalize ${
                  mainTab === t ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-5 space-y-5">

        {/* ── Trends tab ─────────────────────────────────────────────────── */}
        {mainTab === 'trends' && (
          !isPremium ? (
            <div className="bg-slate-800 rounded-2xl p-6 text-center space-y-3">
              <p className="text-3xl">📈</p>
              <p className="font-bold text-lg">Analytics Trends</p>
              <p className="text-slate-400 text-sm">Accuracy trends, subject radar, and weekly activity charts are available on Premium.</p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
              >
                View Plans →
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 tracking-widest mb-3">ACCURACY TREND</p>
                <AccuracyTrendChart data={trendAccuracy} />
              </div>
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 tracking-widest mb-3">SUBJECT BALANCE</p>
                <SubjectRadarChart data={subjectRadarData} />
              </div>
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 tracking-widest mb-3">WEEKLY ACTIVITY</p>
                <WeeklyQuizBar data={weeklyData} />
              </div>
            </div>
          )
        )}

        {/* ── Overview tab ───────────────────────────────────────────────── */}
        {mainTab === 'overview' && <>

        {/* Overview row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'XP',       value: profile.xp.toString(),      icon: '⚡' },
            { label: 'Level',    value: `Lv ${level}`,               icon: '🎖️' },
            { label: 'Quizzes',  value: history.length.toString(),   icon: '📝' },
          ].map((c) => (
            <div key={c.label} className="bg-slate-800 rounded-2xl p-3 text-center">
              <p className="text-lg">{c.icon}</p>
              <p className="text-lg font-bold mt-0.5">{c.value}</p>
              <p className="text-xs text-slate-400">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Activity Heatmap */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">🗓️ Study Activity</h2>
          <ActivityHeatmap history={history} />
        </div>

        {/* Subject accuracy bars */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold text-sm">📈 Subject Accuracy</h2>
          {subjectStats.map((s) => (
            <AccuracyBar
              key={s.subject}
              label={s.subject}
              accuracy={s.accuracy}
              count={s.count}
              icon={SUBJECT_ICONS[s.subject]}
            />
          ))}
          {history.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-2">Complete some quizzes to see accuracy trends.</p>
          )}
        </div>

        {/* Predicted Score */}
        {prediction !== null && (
          <div className="bg-gradient-to-br from-indigo-900/60 to-violet-900/60 border border-indigo-800/40 rounded-2xl p-4">
            <h2 className="font-semibold text-sm mb-3">🎯 Predicted Score</h2>
            <div className="flex items-end gap-3 mb-2">
              <p className="text-4xl font-bold text-white">{prediction.predicted}</p>
              <p className="text-slate-400 text-sm mb-1">/ {prediction.max}</p>
            </div>
            <p className="text-slate-300 text-xs mb-3">
              Estimated range: <span className="text-white font-semibold">{prediction.low}–{prediction.high}</span>
            </p>
            {/* Score bar */}
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
                style={{ width: `${(prediction.predicted / prediction.max) * 100}%` }}
              />
            </div>
            <p className="text-slate-500 text-[10px] mt-2">
              Based on last {Math.min(history.length, 20)} quiz{history.length !== 1 ? 'zes' : ''} · improves as you practice more
            </p>
          </div>
        )}

        {/* Revision stats */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">🧠 Revision Queue</h2>
            {dueCount > 0 && (
              <button
                onClick={() => navigate('/flashcards')}
                className="text-xs bg-primary text-white px-3 py-1 rounded-full font-semibold active:scale-95 transition-transform"
              >
                Review {dueCount} due →
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Due Today',    value: dueCount,              icon: '⏰', color: dueCount > 0 ? 'text-orange-400' : 'text-slate-400' },
              { label: 'In Queue',     value: queue.length,          icon: '📚', color: 'text-slate-300' },
              { label: 'Error Book',   value: errorNotebook.length,  icon: '❌', color: 'text-red-400'   },
            ].map((c) => (
              <div key={c.label} className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-sm">{c.icon}</p>
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
          {dueCount === 0 && queue.length > 0 && (
            <p className="text-slate-600 text-xs text-center mt-3">All caught up! Next cards due tomorrow.</p>
          )}
          {queue.length === 0 && (
            <p className="text-slate-600 text-xs text-center mt-3">
              Complete quizzes to build your revision queue.
            </p>
          )}
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">🔖 Bookmarks</p>
              <p className="text-xs text-slate-400 mt-0.5">{bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => navigate('/flashcards')}
              className="text-xs text-primary font-medium"
            >
              Review →
            </button>
          </div>
        )}

        {/* Chapter Mastery Map */}
        {chapterStats.size > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-sm mb-3">🗺️ Chapter Mastery</h2>

            {/* Subject tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {subjects.map((sub, i) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubjectTab(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSubjectTab === i
                      ? 'bg-primary text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {SUBJECT_ICONS[sub]} {sub}
                </button>
              ))}
            </div>

            <ChapterMasteryMap
              chapterStats={chapterStats}
              subject={subjects[activeSubjectTab]}
              onDrillChapter={drillChapter}
            />

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {[
                { color: 'bg-green-900/70 border border-green-700/50', label: 'Mastered' },
                { color: 'bg-yellow-900/70 border border-yellow-700/50', label: 'Learning' },
                { color: 'bg-red-900/70 border border-red-700/50', label: 'Struggling' },
                { color: 'bg-slate-700', label: 'New' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${l.color}`} />
                  <span className="text-[10px] text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Countdown + Planner */}
        {daysToExam !== null && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">📅 Revision Planner</h2>
              <span className={`text-xs font-bold ${daysToExam <= 30 ? 'text-orange-400' : 'text-indigo-300'}`}>
                {daysToExam}d left
              </span>
            </div>

            {chapterStats.size > 0 ? (() => {
              const struggling = Array.from(chapterStats.values()).filter(
                (s) => s.struggling > 0 || (s.total > 0 && s.mastered / s.total < 0.5)
              );
              const chaptersPerDay = daysToExam > 0
                ? Math.ceil(struggling.length / Math.max(1, daysToExam / 3))
                : struggling.length;

              return (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    {struggling.length} chapter{struggling.length !== 1 ? 's' : ''} need attention ·{' '}
                    <span className="text-white font-medium">~{chaptersPerDay}/day</span> to cover all before exam
                  </p>
                  {struggling.slice(0, 4).map((s) => (
                    <div key={s.chapter} className="flex items-center justify-between bg-slate-700/50 rounded-xl px-3 py-2">
                      <p className="text-xs text-slate-300 truncate flex-1">{s.chapter}</p>
                      <button
                        onClick={() => drillChapter(s.chapter)}
                        className="text-xs text-primary font-medium ml-2 flex-shrink-0"
                      >
                        Drill →
                      </button>
                    </div>
                  ))}
                  {struggling.length > 4 && (
                    <p className="text-xs text-slate-600 text-center">+{struggling.length - 4} more chapters</p>
                  )}
                </div>
              );
            })() : (
              <p className="text-slate-600 text-xs">
                Complete more quizzes to unlock your personalised revision plan.
              </p>
            )}
          </div>
        )}

        </>}

      </main>

      <BottomNav active="stats" />
    </div>
  );
}
