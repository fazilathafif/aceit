interface Props {
  name: string;
  exam: string;
  level: number;
  streak: number;
  xp: number;
  weeklyXp: number;
  rank: number;
  totalUsers: number;
}

export default function RankCard({ name, exam, level, streak, xp, weeklyXp, rank, totalUsers }: Props) {
  const topPercent = Math.max(1, Math.round((rank / totalUsers) * 100));

  async function handleShare() {
    const text = `🎓 ${name} | ${exam.replace('_', ' ')} | Level ${level}\n🔥 ${streak} day streak · ⚡ ${xp} XP\n🏆 Top ${topPercent}% this week on AceIt`;
    if (navigator.share) {
      await navigator.share({ title: 'My AceIt Rank', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/70 to-violet-900/70 border border-indigo-700/40 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-indigo-300 font-semibold tracking-widest">MY RANK CARD</p>
          <h2 className="text-xl font-bold mt-1">{name}</h2>
          <p className="text-indigo-300 text-xs mt-0.5">{exam.replace('_', ' ')} · Level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">#{rank}</p>
          <p className="text-[10px] text-indigo-300 mt-0.5">Top {topPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Streak', value: `${streak}d`, icon: '🔥' },
          { label: 'Total XP', value: xp.toString(), icon: '⚡' },
          { label: 'This Week', value: `+${weeklyXp}`, icon: '📈' },
        ].map((s) => (
          <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-base">{s.icon}</p>
            <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
            <p className="text-[10px] text-indigo-300">{s.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleShare}
        className="w-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-xs font-semibold py-2.5 rounded-xl"
      >
        Share Rank Card 🔗
      </button>
    </div>
  );
}
