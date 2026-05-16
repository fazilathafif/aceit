import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useRevision } from '../context/RevisionContext';
import { useMode } from '../context/ModeContext';
import { getQuestionsForConfig } from '../data/questions';
import { getChapters } from '../data/syllabus';
import { JOKES } from '../data/jokes';
import { AFFIRMATIONS } from '../data/affirmations';
import { getDayOfYear } from '../lib/gameUtils';
import DailyCheckIn, { MoodSuggestion } from '../components/DailyCheckIn';
import BreathingExercise from '../components/BreathingExercise';
import ChallengesWidget from '../components/ChallengesWidget';
import BottomNav from '../components/BottomNav';
import type { Subject, QuizConfig } from '../types';

const SUBJECT_ICONS: Record<string, string> = {
  Physics: '🔭',
  Chemistry: '⚗️',
  Biology: '🧬',
  Mathematics: '📐',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { dispatch } = useQuiz();
  const { user } = useAuth();
  const {
    profile,
    dailyState,
    level,
    xpProgress,
    xpToNext,
    streakPersonality,
    daysToExam,
    newlyEarnedBadges,
    clearNewBadges,
    revealJoke,
    setExamDate,
  } = useGame();

  const { dueCount } = useRevision();
  const { can } = useMode();

  const [breathingOpen, setBreathingOpen] = useState(false);
  const [examInput, setExamInput] = useState('');
  const [showExamPicker, setShowExamPicker] = useState(false);

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const dayIdx = getDayOfYear();
  const todayJoke = JOKES[dayIdx % JOKES.length];
  const todayAffirmation = AFFIRMATIONS[dayIdx % AFFIRMATIONS.length];

  const subjects: Subject[] =
    user?.exam === 'NEET'
      ? ['Physics', 'Chemistry', 'Biology']
      : ['Physics', 'Chemistry', 'Mathematics'];

  function startQuickDrill(subject: Subject) {
    if (!user) return;
    const classLevel = user.classLevel;
    const chapters = getChapters(user.exam, subject, classLevel === 'Both' ? 'Both' : classLevel);
    const chapterNames = chapters.map((c) => c.name);
    const config: QuizConfig = {
      exam: user.exam,
      classLevel,
      subject,
      chapters: chapterNames,
      difficulty: 'Mixed',
      questionCount: 5,
      timerSeconds: 0,
      mode: 'Practice',
    };
    const questions = getQuestionsForConfig(subject, chapterNames, 'Mixed', 5);
    if (questions.length === 0) return;
    dispatch({ type: 'START_QUIZ', config, questions });
    navigate('/quiz');
  }

  function handleSetExamDate() {
    if (examInput) {
      setExamDate(examInput);
      setShowExamPicker(false);
    }
  }

  // Auto-dismiss badge toast after 4s
  if (newlyEarnedBadges.length > 0) {
    setTimeout(clearNewBadges, 4000);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">

      {/* Badge Toast */}
      {can('gamification') && newlyEarnedBadges.length > 0 && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-primary/50 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-bounce">
          <span className="text-2xl">{newlyEarnedBadges[0].icon}</span>
          <div>
            <p className="text-xs text-primary font-semibold">Badge Unlocked!</p>
            <p className="text-sm font-bold">{newlyEarnedBadges[0].name}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-slate-400 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold">Hey {firstName} 👋</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-orange-400 font-bold text-sm">
                {streakPersonality.emoji} {profile.streak} day{profile.streak !== 1 ? 's' : ''}
              </span>
              <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-xs border border-indigo-800/50">
                Lv {level}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">{streakPersonality.label}</p>
          </div>
        </div>

        {/* XP Bar */}
        {can('gamification') && (
        <div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-slate-600 text-xs">{profile.xp} XP</p>
            <p className="text-slate-500 text-xs">{xpToNext} XP to Level {level + 1}</p>
          </div>
        </div>
        )}
      </header>

      <main className="px-5 space-y-4">

        {/* Daily check-in */}
        {can('wellbeing') && (!dailyState.mood ? (
          <DailyCheckIn />
        ) : (
          <MoodSuggestion mood={dailyState.mood} />
        ))}

        {/* Revision due today */}
        {dueCount > 0 && (
          <button
            onClick={() => navigate('/flashcards')}
            className="w-full flex items-center justify-between bg-orange-900/30 border border-orange-700/50 rounded-2xl px-4 py-3 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🧠</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-orange-300">
                  {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                </p>
                <p className="text-xs text-slate-500">Spaced repetition · tap to start</p>
              </div>
            </div>
            <span className="text-orange-400 text-sm font-bold">→</span>
          </button>
        )}

        {/* Daily Affirmation */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-indigo-400 font-semibold tracking-widest mb-1">💡 TODAY'S INSIGHT</p>
          <p className="text-sm text-slate-300 leading-relaxed">{todayAffirmation}</p>
        </div>

        {/* Dad Joke */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <p className="text-[10px] text-yellow-400 font-semibold tracking-widest mb-2">😂 DAD JOKE OF THE DAY</p>
          <p className="text-sm text-slate-200 font-medium">{todayJoke.setup}</p>
          {dailyState.jokeRevealed ? (
            <p className="text-sm text-yellow-300 mt-2 font-semibold">{todayJoke.punchline}</p>
          ) : (
            <button
              onClick={revealJoke}
              className="mt-2 text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
            >
              Reveal punchline →
            </button>
          )}
        </div>

        {/* Challenges */}
        {can('gamification') && <ChallengesWidget />}

        {/* Quick Drill */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-orange-400 font-semibold tracking-widest">⚡ QUICK DRILL</p>
              <p className="text-xs text-slate-400 mt-0.5">5 questions · no setup · go now</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => startQuickDrill(sub)}
                className="bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded-xl py-3 px-2 flex flex-col items-center gap-1.5"
              >
                <span className="text-2xl leading-none">{SUBJECT_ICONS[sub]}</span>
                <span className="text-xs font-medium text-slate-300">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Quiz CTA */}
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-indigo-200 text-[10px] font-semibold tracking-widest">SMART QUIZ</p>
              <h2 className="text-lg font-bold mt-1">Full Adaptive Session</h2>
              <p className="text-indigo-200 text-xs mt-1">Custom topic, difficulty & question count</p>
            </div>
            <span className="text-3xl">🧠</span>
          </div>
          <button
            onClick={() => navigate('/setup')}
            className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
          >
            Configure Quiz →
          </button>
        </div>

        {/* Mock Test CTA */}
        <button
          onClick={() => navigate('/mock')}
          className="w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-4 text-left active:scale-95 transition-transform flex items-center gap-4"
        >
          <span className="text-3xl">📝</span>
          <div className="flex-1">
            <p className="font-bold text-sm">Full Mock Test</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.exam === 'NEET' ? '180Q · 200 min · NEET pattern' :
               user?.exam === 'JEE_ADVANCED' ? '60Q · 180 min · Advanced pattern' :
               '90Q · 180 min · JEE Main pattern'}
            </p>
          </div>
          <span className="text-slate-500 text-sm">→</span>
        </button>

        {/* Study Path CTA */}
        <button
          onClick={() => navigate('/studypath')}
          className="w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-4 text-left active:scale-95 transition-transform flex items-center gap-4"
        >
          <span className="text-3xl">🗺️</span>
          <div className="flex-1">
            <p className="font-bold text-sm">My Study Path</p>
            <p className="text-xs text-slate-400 mt-0.5">Personalised schedule · chapter mastery · AI plan</p>
          </div>
          <span className="text-slate-500 text-sm">→</span>
        </button>

        {/* Formula Sheets shortcut */}
        <button
          onClick={() => navigate('/concepts')}
          className="w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-4 text-left active:scale-95 transition-transform flex items-center gap-4"
        >
          <span className="text-3xl">📐</span>
          <div className="flex-1">
            <p className="font-bold text-sm">Formula Sheets</p>
            <p className="text-xs text-slate-400 mt-0.5">Key formulas · concept notes · drill chapters</p>
          </div>
          <span className="text-slate-500 text-sm">→</span>
        </button>

        {/* Wellbeing Corner */}
        {can('wellbeing') && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-teal-400 font-semibold tracking-widest mb-3">🫁 WELLBEING CORNER</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBreathingOpen(true)}
              className="bg-teal-900/40 border border-teal-800/50 hover:bg-teal-900/60 active:scale-95 transition-all rounded-xl p-3 text-left"
            >
              <p className="text-lg mb-1">🌬️</p>
              <p className="text-xs font-semibold text-teal-300">Breathing</p>
              <p className="text-[10px] text-slate-500 mt-0.5">45 sec · +5 XP</p>
            </button>
            <button
              onClick={() => navigate('/tutor')}
              className="bg-violet-900/40 border border-violet-800/50 hover:bg-violet-900/60 active:scale-95 transition-all rounded-xl p-3 text-left"
            >
              <p className="text-lg mb-1">🤖</p>
              <p className="text-xs font-semibold text-violet-300">AI Tutor</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Ask anything</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-3 text-center">
            Even toppers breathe. Take care of the machine doing the work.
          </p>
        </div>
        )}

        {/* Exam Countdown */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-widest">⏳ EXAM COUNTDOWN</p>
              {daysToExam !== null ? (
                <>
                  <p className="text-3xl font-bold text-white mt-1">{daysToExam}</p>
                  <p className="text-slate-400 text-xs">days to {user?.exam.replace('_', ' ')}</p>
                  {daysToExam <= 30 && (
                    <p className="text-xs text-orange-400 mt-1">Final Sprint mode — stay focused 💪</p>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-xs mt-1">Set your exam date to start the countdown</p>
              )}
            </div>
            {daysToExam === null && (
              <button
                onClick={() => setShowExamPicker((v) => !v)}
                className="text-xs text-primary font-medium"
              >
                Set date →
              </button>
            )}
          </div>
          {showExamPicker && (
            <div className="mt-3 flex gap-2">
              <input
                type="date"
                value={examInput}
                onChange={(e) => setExamInput(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2"
              />
              <button
                onClick={handleSetExamDate}
                className="bg-primary text-white text-xs font-bold px-4 rounded-xl active:scale-95 transition-transform"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Subject Cards */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2 tracking-widest">SUBJECTS</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => navigate('/setup', { state: { preSubject: sub } })}
                className="bg-slate-800 rounded-2xl p-4 text-left active:scale-95 transition-transform hover:bg-slate-700"
              >
                <span className="text-3xl">{SUBJECT_ICONS[sub]}</span>
                <p className="font-semibold mt-2">{sub}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sub === 'Biology' ? 'NEET only' : sub === 'Mathematics' ? 'JEE only' : 'NEET + JEE'}
                </p>
              </button>
            ))}
          </div>
        </div>

      </main>

      <BottomNav active="home" />

      {breathingOpen && (
        <BreathingExercise onClose={() => setBreathingOpen(false)} />
      )}
    </div>
  );
}
