import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRevision } from '../context/RevisionContext';
import { useQuiz } from '../context/QuizContext';
import { getQuestionsForConfig } from '../data/questions';
import { getChapters } from '../data/syllabus';
import { getSubjectAccuracy } from '../lib/gameUtils';
import { generateStudyPath } from '../lib/claude';
import StudySchedule from '../components/StudySchedule';
import TopicMasteryBar from '../components/TopicMasteryBar';
import BottomNav from '../components/BottomNav';
import type { QuizConfig, Subject } from '../types';
import type { WeekPlan } from '../components/StudySchedule';

// Build a local study schedule from chapterStats without AI
function buildLocalSchedule(
  weakChapters: { chapter: string; subject: string; mastery: number }[],
  daysLeft: number
): WeekPlan[] {
  const weeksCount = Math.min(Math.ceil(daysLeft / 7), 6);
  const weeks: WeekPlan[] = [];
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let chapterIdx = 0;

  for (let w = 0; w < weeksCount; w++) {
    const days = DAY_NAMES.map((d, di) => {
      if (di === 6) return { dayLabel: `${d} (Rest)`, tasks: [] }; // Sunday rest
      const task = weakChapters[chapterIdx % Math.max(weakChapters.length, 1)];
      chapterIdx++;
      return {
        dayLabel: d,
        tasks: task ? [{ ...task, quizCount: 2 }] : [],
      };
    });
    weeks.push({ weekLabel: `Week ${w + 1}`, days });
  }
  return weeks;
}

const STUDY_PATH_CACHE_PREFIX = 'aceit_studypath_';

export default function StudyPathScreen() {
  const navigate = useNavigate();
  const { user, getHistory } = useAuth();
  const { dispatch } = useQuiz();
  const { chapterStats } = useRevision();

  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'schedule' | 'mastery' | 'ai'>('schedule');

  const history = getHistory();

  if (!user) { navigate('/login'); return null; }

  const examDate = localStorage.getItem(`aceit_examdate_${user.id}`);
  const daysLeft = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null;

  const subjects: Subject[] = user.exam === 'NEET'
    ? ['Physics', 'Chemistry', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];

  // Build weak chapters list sorted by mastery ascending
  const weakChapters = Array.from(chapterStats.values())
    .map((s) => ({
      chapter: s.chapter,
      subject: s.subject,
      mastery: s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0,
    }))
    .sort((a, b) => a.mastery - b.mastery);

  const subjectAccuracy = getSubjectAccuracy(history);
  const schedule = daysLeft !== null ? buildLocalSchedule(weakChapters, daysLeft) : [];

  // Load AI plan (cached per day)
  const loadAiPlan = useCallback(async (force = false) => {
    if (!daysLeft) return;
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${STUDY_PATH_CACHE_PREFIX}${user.id}_${today}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setAiPlan(cached); return; }
    }
    setLoading(true);
    try {
      const plan = await generateStudyPath(user.exam, daysLeft, weakChapters, subjectAccuracy);
      localStorage.setItem(cacheKey, plan);
      setAiPlan(plan);
    } finally {
      setLoading(false);
    }
  }, [daysLeft, user.id, user.exam, weakChapters, subjectAccuracy]);

  useEffect(() => { if (tab === 'ai') loadAiPlan(); }, [tab, loadAiPlan]);

  function drillChapter(chapter: string) {
    const subject = (subjects.find((s) =>
      chapterStats.get(chapter)?.subject === s
    ) ?? subjects[0]) as Subject;
    const chapters = getChapters(user!.exam, subject, user!.classLevel === 'Both' ? 'Both' : user!.classLevel);
    const chapterNames = chapters.map((c) => c.name);
    const config: QuizConfig = {
      exam: user!.exam, classLevel: user!.classLevel, subject,
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
        <p className="text-slate-400 text-sm">PERSONALISED</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold">Study Path 🗺️</h1>
          {daysLeft !== null && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft <= 30 ? 'bg-orange-900/50 text-orange-400' : 'bg-indigo-900/50 text-indigo-300'}`}>
              {daysLeft}d left
            </span>
          )}
        </div>
        {daysLeft === null && (
          <p className="text-xs text-slate-500 mt-1">Set your exam date in Home to unlock the schedule.</p>
        )}
      </header>

      {/* Tab bar */}
      <div className="px-5 mb-5">
        <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
          {(['schedule', 'mastery', 'ai'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-colors capitalize ${
                tab === t ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'ai' ? 'AI Plan' : t === 'schedule' ? 'Schedule' : 'Mastery'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 space-y-5">

        {/* ── Schedule tab ──────────────────────────────────────────── */}
        {tab === 'schedule' && (
          <>
            {weakChapters.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-3">📚</p>
                <p className="text-sm font-semibold">No data yet</p>
                <p className="text-xs text-slate-500 mt-1">Complete a few quizzes to see your personalised schedule here.</p>
              </div>
            ) : (
              <StudySchedule weeks={schedule} onDrill={drillChapter} />
            )}
          </>
        )}

        {/* ── Mastery tab ───────────────────────────────────────────── */}
        {tab === 'mastery' && (
          <>
            {weakChapters.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-3">📊</p>
                <p className="text-sm font-semibold">No chapter data yet</p>
                <p className="text-xs text-slate-500 mt-1">Quiz across different chapters to build your mastery map.</p>
              </div>
            ) : (
              subjects.map((sub) => {
                const subChapters = weakChapters.filter((c) => c.subject === sub);
                if (subChapters.length === 0) return null;
                return (
                  <div key={sub} className="bg-slate-800 rounded-2xl p-4">
                    <h2 className="text-sm font-semibold mb-3">{sub}</h2>
                    <div className="space-y-3">
                      {subChapters.map((c) => (
                        <div key={c.chapter} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <TopicMasteryBar chapter={c.chapter} mastery={c.mastery} />
                          </div>
                          <button
                            onClick={() => drillChapter(c.chapter)}
                            className="text-xs text-primary font-medium flex-shrink-0 active:scale-95 transition-transform"
                          >
                            Drill →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── AI Plan tab ───────────────────────────────────────────── */}
        {tab === 'ai' && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">🤖 AI-Generated Plan</h2>
              {!loading && (
                <button
                  onClick={() => loadAiPlan(true)}
                  className="text-xs text-primary font-medium active:scale-95 transition-transform"
                >
                  Refresh ↺
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <div className="w-4 h-4 rounded-full bg-primary animate-bounce" />
                <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
              </div>
            ) : aiPlan ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-xs">
                {aiPlan}
              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">
                {daysLeft === null
                  ? 'Set your exam date first to generate a plan.'
                  : 'Tap Refresh to generate your AI study plan.'}
              </p>
            )}
          </div>
        )}

      </main>

      <BottomNav active="studypath" />
    </div>
  );
}
