import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import { getQuestionsForConfig } from '../data/questions';
import { getChapters } from '../data/syllabus';
import { FORMULAS } from '../data/formulas';
import { CONCEPTS } from '../data/concepts';
import FormulaCard from '../components/FormulaCard';
import BottomNav from '../components/BottomNav';
import type { Subject, QuizConfig } from '../types';

const SUBJECT_CHAPTERS: Record<string, Subject> = {};
// Pre-build chapter→subject map from FORMULAS keys (Physics and Maths chapters)
const PHYSICS_CHAPTERS = new Set([
  'Laws of Motion', 'Work, Energy and Power', 'Gravitation', 'Waves',
  'Thermodynamics', 'Electrostatics', 'Current Electricity', 'Optics',
]);
const MATHS_CHAPTERS = new Set([
  'Trigonometry', 'Differentiation', 'Integration', 'Coordinate Geometry',
]);
Object.keys(FORMULAS).forEach((ch) => {
  SUBJECT_CHAPTERS[ch] = PHYSICS_CHAPTERS.has(ch) ? 'Physics' : MATHS_CHAPTERS.has(ch) ? 'Mathematics' : 'Chemistry';
});

const SUBJECT_ORDER: Subject[] = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

export default function ConceptsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useQuiz();

  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [conceptTab, setConceptTab] = useState<'formulas' | 'concepts'>('formulas');

  if (!user) { navigate('/login'); return null; }

  const subjects: Subject[] = user.exam === 'NEET'
    ? ['Physics', 'Chemistry', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];

  const chaptersForSubject = Object.keys(FORMULAS).filter(
    (ch) => SUBJECT_CHAPTERS[ch] === selectedSubject
  );

  function drillChapter(chapter: string) {
    const subject = SUBJECT_CHAPTERS[chapter] ?? selectedSubject;
    const allChapters = getChapters(user!.exam, subject, user!.classLevel === 'Both' ? 'Both' : user!.classLevel);
    const chapterNames = allChapters.map((c) => c.name);
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

  const formulas = selectedChapter ? (FORMULAS[selectedChapter] ?? []) : [];
  const concept  = selectedChapter ? (CONCEPTS[selectedChapter] ?? null) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        {selectedChapter ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChapter(null)} className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Back
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs">{selectedSubject}</p>
              <h1 className="text-xl font-bold truncate">{selectedChapter}</h1>
            </div>
            <button
              onClick={() => drillChapter(selectedChapter)}
              className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-semibold active:scale-95 transition-transform flex-shrink-0"
            >
              Drill →
            </button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm">FORMULA SHEETS</p>
            <h1 className="text-2xl font-bold mt-1">Concepts 📖</h1>
          </>
        )}
      </header>

      {!selectedChapter && (
        /* Subject tabs */
        <div className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSubject === sub
                    ? 'bg-primary text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="px-5 space-y-3">

        {/* Chapter list */}
        {!selectedChapter && (
          <>
            {chaptersForSubject.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-3">📚</p>
                <p className="text-sm text-slate-400">No formula sheets yet for {selectedSubject}.</p>
              </div>
            ) : (
              chaptersForSubject.map((ch) => {
                const formulaCount = FORMULAS[ch]?.length ?? 0;
                const hasConcept   = Boolean(CONCEPTS[ch]);
                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedChapter(ch)}
                    className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-2xl px-4 py-3.5 text-left flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ch}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formulaCount} formula{formulaCount !== 1 ? 's' : ''}
                        {hasConcept ? ' · concept note' : ''}
                      </p>
                    </div>
                    <span className="text-slate-600 text-sm">→</span>
                  </button>
                );
              })
            )}
          </>
        )}

        {/* Chapter detail */}
        {selectedChapter && (
          <>
            {/* Inner tab bar */}
            <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5 mb-1">
              {(['formulas', 'concepts'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setConceptTab(t)}
                  className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-colors capitalize ${
                    conceptTab === t ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'formulas' ? '📐 Formulas' : '💡 Concepts'}
                </button>
              ))}
            </div>

            {conceptTab === 'formulas' && (
              formulas.length > 0 ? (
                <div className="space-y-3">
                  {formulas.map((f, i) => <FormulaCard key={i} entry={f} />)}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">No formulas available yet.</p>
              )
            )}

            {conceptTab === 'concepts' && (
              concept ? (
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-indigo-300 mb-2">OVERVIEW</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{concept.summary}</p>
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-green-400 mb-3">KEY POINTS</p>
                    <ul className="space-y-2">
                      {concept.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{kp}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {concept.commonMistakes && concept.commonMistakes.length > 0 && (
                    <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-red-400 mb-3">COMMON MISTAKES</p>
                      <ul className="space-y-2">
                        {concept.commonMistakes.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{m}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">No concept note available yet.</p>
              )
            )}
          </>
        )}

      </main>

      <BottomNav active="learn" />
    </div>
  );
}
