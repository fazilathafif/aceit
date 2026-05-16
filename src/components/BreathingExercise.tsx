import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASES: { phase: Phase; label: string; duration: number; color: string; scale: string }[] = [
  { phase: 'inhale',  label: 'Inhale...',  duration: 4000, color: 'bg-blue-500/30 border-blue-400',    scale: 'scale-100' },
  { phase: 'hold',    label: 'Hold...',    duration: 4000, color: 'bg-indigo-500/30 border-indigo-400', scale: 'scale-100' },
  { phase: 'exhale',  label: 'Exhale...', duration: 6000, color: 'bg-purple-500/30 border-purple-400', scale: 'scale-60'  },
];

const TOTAL_CYCLES = 3;

interface Props {
  onClose: () => void;
}

export default function BreathingExercise({ onClose }: Props) {
  const { completeBreathing } = useGame();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = PHASES[phaseIdx];

  useEffect(() => {
    setExpanding(phaseIdx === 0 || phaseIdx === 1);

    timerRef.current = setTimeout(() => {
      const nextIdx = (phaseIdx + 1) % PHASES.length;
      if (phaseIdx === PHASES.length - 1) {
        if (cycle >= TOTAL_CYCLES) {
          setDone(true);
          completeBreathing();
        } else {
          setCycle((c) => c + 1);
          setPhaseIdx(0);
        }
      } else {
        setPhaseIdx(nextIdx);
      }
    }, current.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phaseIdx, cycle, current.duration, completeBreathing]);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
      <div className="w-full max-w-sm text-center">
        {done ? (
          <div className="space-y-5">
            <p className="text-5xl">🫁</p>
            <h2 className="text-2xl font-bold text-white">Well done.</h2>
            <p className="text-slate-300 text-sm">
              3 cycles complete. You earned <span className="text-green-400 font-bold">+5 XP</span>.<br />
              Your brain is now better oxygenated for learning.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform"
            >
              Back to Studying
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-400 text-sm">Cycle {cycle} of {TOTAL_CYCLES}</p>
              <p className="text-slate-500 text-xs mt-1">
                {PHASES.map((p, i) => (
                  <span key={p.phase} className={i === phaseIdx ? 'text-white font-semibold' : ''}>
                    {i > 0 ? ' · ' : ''}{p.label.replace('...', '')}
                  </span>
                ))}
              </p>
            </div>

            {/* Animated circle */}
            <div className="flex items-center justify-center mb-8">
              <div
                className={`w-48 h-48 rounded-full border-2 flex items-center justify-center transition-all ${
                  expanding ? 'duration-[4000ms]' : 'duration-[6000ms]'
                } ${current.color} ${expanding ? 'scale-100' : 'scale-[0.6]'}`}
              >
                <div
                  className={`w-28 h-28 rounded-full border border-white/20 flex items-center justify-center transition-all ${
                    expanding ? 'duration-[4000ms]' : 'duration-[6000ms]'
                  } ${expanding ? 'scale-100 bg-white/10' : 'scale-[0.6] bg-transparent'}`}
                >
                  <span className="text-2xl">🌬️</span>
                </div>
              </div>
            </div>

            <p className="text-2xl font-light text-white tracking-wide">{current.label}</p>
            <p className="text-slate-500 text-xs mt-2">
              {current.duration / 1000} seconds
            </p>

            <button
              onClick={onClose}
              className="mt-10 text-slate-600 text-sm hover:text-slate-400 transition-colors"
            >
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
}
