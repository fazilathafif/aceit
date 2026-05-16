import type { FormulaEntry } from '../data/formulas';

interface Props {
  entry: FormulaEntry;
}

export default function FormulaCard({ entry }: Props) {
  return (
    <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
      <p className="text-xs font-semibold text-indigo-300">{entry.name}</p>
      <p className="font-mono text-sm text-white bg-slate-900/60 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed">
        {entry.formula}
      </p>
      <p className="text-xs text-slate-400 leading-relaxed">{entry.description}</p>
      {entry.example && (
        <p className="text-xs text-slate-500 italic">e.g. {entry.example}</p>
      )}
    </div>
  );
}
