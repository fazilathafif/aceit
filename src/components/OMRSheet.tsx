import type { Question } from '../types';

interface Props {
  questions: Question[];
  answers: (number | null)[];
  flagged: boolean[];
  currentGlobal: number;
  onJump: (idx: number) => void;
  onClose: () => void;
}

export default function OMRSheet({ questions, answers, flagged, currentGlobal, onJump, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
      <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-sm">Answer Sheet</p>
          <button onClick={onClose} className="text-slate-400 text-sm">Close ✕</button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[10px] text-slate-400 mb-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Flagged</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-600 inline-block" /> Not answered</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => {
            const answered = answers[i] !== null;
            const isFlagged = flagged[i];
            const isCurrent = i === currentGlobal;
            let cls = 'bg-slate-700 text-slate-300';
            if (isFlagged) cls = 'bg-yellow-600 text-white';
            else if (answered) cls = 'bg-green-700 text-white';
            if (isCurrent) cls += ' ring-2 ring-white';
            return (
              <button
                key={i}
                onClick={() => { onJump(i); onClose(); }}
                className={`w-9 h-9 rounded-lg text-xs font-bold ${cls}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-slate-500 text-center">
          {answers.filter((a) => a !== null).length}/{questions.length} answered
        </div>
      </div>
    </div>
  );
}
