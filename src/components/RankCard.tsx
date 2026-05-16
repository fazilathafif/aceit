import { useState } from 'react';

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

const PLATFORMS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    bg: 'bg-[#0A66C2]',
    getUrl: (text: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?summary=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    bg: 'bg-[#1877F2]',
    getUrl: (text: string) =>
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent('https://aceit.app')}`,
  },
  {
    id: 'twitter',
    label: 'X',
    icon: '𝕏',
    bg: 'bg-black border border-slate-600',
    getUrl: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    bg: 'bg-[#25D366]',
    getUrl: (text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📸',
    bg: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]',
    getUrl: () => null, // no web URL — uses native share or clipboard
  },
];

export default function RankCard({ name, exam, level, streak, xp, weeklyXp, rank, totalUsers }: Props) {
  const topPercent = Math.max(1, Math.round((rank / totalUsers) * 100));
  const [copied, setCopied] = useState(false);

  const shareText = `🎓 ${name} | ${exam.replace(/_/g, ' ')} Prep | Level ${level}\n🔥 ${streak} day streak · ⚡ ${xp} XP\n🏆 Ranked #${rank} (Top ${topPercent}%) this week\n📚 Studying hard on AceIt — the JEE/NEET prep app`;

  async function shareToInstagram() {
    if (navigator.share) {
      await navigator.share({ title: 'My AceIt Rank', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handlePlatform(platformId: string, url: string | null) {
    if (platformId === 'instagram') { shareToInstagram(); return; }
    if (url) window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/70 to-violet-900/70 border border-indigo-700/40 rounded-2xl p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-indigo-300 font-semibold tracking-widest">MY RANK CARD</p>
          <h2 className="text-xl font-bold mt-1">{name}</h2>
          <p className="text-indigo-300 text-xs mt-0.5">{exam.replace(/_/g, ' ')} · Level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">#{rank}</p>
          <p className="text-[10px] text-indigo-300 mt-0.5">Top {topPercent}%</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
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

      {/* Share section */}
      <div>
        <p className="text-[10px] text-indigo-300 font-semibold tracking-widest mb-3">SHARE YOUR RANK</p>

        {/* Platform buttons */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PLATFORMS.map((p) => {
            const url = p.getUrl(shareText);
            return (
              <button
                key={p.id}
                onClick={() => handlePlatform(p.id, url)}
                className={`${p.bg} rounded-xl py-2.5 flex flex-col items-center gap-1 active:scale-90 transition-transform`}
              >
                <span className="text-white text-sm font-black leading-none">{p.icon}</span>
                <span className="text-white text-[9px] font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Copy to clipboard */}
        <button
          onClick={copyToClipboard}
          className="w-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-xs font-semibold py-2.5 rounded-xl"
        >
          {copied ? '✓ Copied to clipboard!' : 'Copy text to clipboard 📋'}
        </button>

        <p className="text-[10px] text-indigo-400/60 text-center mt-2">
          Instagram tip: copy text, open app, paste in your story or bio
        </p>
      </div>
    </div>
  );
}
