import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getDailyQuestions, getDailyLeaderboard } from '../lib/arenaUtils';
import BottomNav from '../components/BottomNav';

export default function DailyChallengeScreen() {
  const navigate = useNavigate();
  const { dispatch } = useQuiz();
  const { dailyState } = useGame();
  const { user } = useAuth();

  const alreadyDone = dailyState.dailyChallengeScore !== null;

  function startChallenge() {
    const questions = getDailyQuestions(10);
    dispatch({
      type: 'START_QUIZ',
      config: {
        exam: user?.exam ?? 'JEE_MAIN',
        classLevel: 'Both',
        subject: 'Physics',
        chapters: [],
        difficulty: 'Mixed',
        questionCount: 10,
        timerSeconds: 30,
        mode: 'DailyChallenge',
      },
      questions,
    });
    navigate('/quiz');
  }

  const leaderboard = alreadyDone
    ? getDailyLeaderboard(dailyState.dailyChallengeScore!, 10, user?.name ?? 'You')
    : null;

  const userRank = leaderboard?.find((e) => e.isUser)?.rank ?? null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        <button onClick={() => navigate('/arena')} className="text-slate-400 text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <p className="text-[10px] text-rose-400 font-semibold tracking-widest">🎯 ARENA</p>
        <h1 className="text-2xl font-bold mt-1">Daily Challenge</h1>
        <p className="text-slate-400 text-sm mt-0.5">Same 10 questions for everyone today</p>
      </header>

      <main className="px-5 space-y-4">
        {/* Status card */}
        <div className={`rounded-2xl p-5 ${alreadyDone
          ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-700/40'
          : 'bg-gradient-to-br from-rose-900/50 to-orange-900/50 border border-rose-700/40'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{alreadyDone ? '✅' : '🎯'}</span>
            <div>
              <p className="font-bold text-lg">{alreadyDone ? 'Challenge Complete!' : "Today's Challenge"}</p>
              {alreadyDone ? (
                <p className="text-green-300 text-sm">
                  You scored {dailyState.dailyChallengeScore}/10
                  {userRank && ` · Rank #${userRank}`}
                </p>
              ) : (
                <p className="text-slate-300 text-sm">10 questions · 30s each · Mixed difficulty</p>
              )}
            </div>
          </div>

          {!alreadyDone && (
            <button
              onClick={startChallenge}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
            >
              Start Challenge →
            </button>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-400 tracking-widest mb-3">TODAY'S LEADERBOARD</p>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                    entry.isUser ? 'bg-indigo-900/40 border border-indigo-700/40' : ''
                  }`}
                >
                  <span className={`text-sm font-bold w-6 text-center ${
                    entry.rank === 1 ? 'text-yellow-400' :
                    entry.rank === 2 ? 'text-slate-300' :
                    entry.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <span className="text-lg w-7 text-center">{entry.avatar}</span>
                  <span className={`flex-1 text-sm ${entry.isUser ? 'font-bold text-indigo-300' : 'text-slate-200'}`}>
                    {entry.isUser ? `${entry.name} (You)` : entry.name}
                  </span>
                  <span className="text-sm font-semibold">{entry.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        {!alreadyDone && (
          <div className="bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
            {[
              { icon: '🔁', text: 'Same questions for all students today' },
              { icon: '⏱', text: '30 seconds per question — think fast!' },
              { icon: '⚡', text: 'Bonus XP for high scores' },
              { icon: '📅', text: 'New challenge every day at midnight' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="arena" />
    </div>
  );
}
