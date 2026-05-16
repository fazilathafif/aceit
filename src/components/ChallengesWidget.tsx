import { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { ChallengeProgress } from '../context/GameContext';

const CHALLENGE_HINT: Record<string, string> = {
  d_quiz1:  'Complete any quiz to unlock',
  d_quiz3:  'Complete 3 quizzes in a day',
  d_acc:    'Score 80% or more on any quiz',
  d_perf:   'Score 100% on any quiz',
  d_breath: 'Do a breathing exercise from the Wellbeing Corner',
  d_subs:   'Quiz in 2 different subjects today',
  w_quiz10: 'Complete 10 quizzes this week',
  w_subs3:  'Quiz in all 3 subjects this week',
  w_acc5:   'Score 80%+ on 5 quizzes this week',
};

function ChallengeRow({ c }: { c: ChallengeProgress }) {
  const [showHint, setShowHint] = useState(false);
  const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
  const hint = CHALLENGE_HINT[c.id];

  return (
    <div className={`py-2.5 ${c.completed ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl w-7 text-center flex-shrink-0">{c.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{c.title}</p>
              {!c.completed && hint && (
                <button
                  onClick={() => setShowHint((v) => !v)}
                  className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                  aria-label="How to complete"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3.5c.4 0 .75.3.75.75v3.5a.75.75 0 0 1-1.5 0v-3.5c0-.45.35-.75.75-.75z"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {c.completed ? (
                <span className="text-[10px] text-green-400 font-bold">Done ✓</span>
              ) : (
                <span className="text-[10px] text-slate-500">{c.progress}/{c.target}</span>
              )}
              <span className="text-[10px] text-indigo-400 font-semibold">+{c.xpReward} XP</span>
            </div>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                c.completed ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      {showHint && hint && (
        <p className="text-[11px] text-slate-400 mt-1.5 ml-10 bg-slate-700/50 rounded-lg px-2.5 py-1.5 leading-snug">
          💡 {hint}
        </p>
      )}
    </div>
  );
}

export default function ChallengesWidget() {
  const { dailyChallenges, weeklyChallenges } = useGame();
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const challenges = tab === 'daily' ? dailyChallenges : weeklyChallenges;
  const doneCount  = challenges.filter((c) => c.completed).length;

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] text-violet-400 font-semibold tracking-widest">🏅 CHALLENGES</p>
          <p className="text-xs text-slate-500 mt-0.5">{doneCount}/{challenges.length} complete</p>
        </div>
        <div className="flex bg-slate-700 rounded-xl p-0.5 gap-0.5">
          {(['daily', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-[10px] text-[11px] font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'daily' ? 'Today' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {challenges.map((c) => (
          <ChallengeRow key={c.id} c={c} />
        ))}
      </div>

      {doneCount === challenges.length && challenges.length > 0 && (
        <p className="text-center text-xs text-green-400 mt-3 font-semibold">
          🎉 All {tab} challenges complete!
        </p>
      )}
    </div>
  );
}
