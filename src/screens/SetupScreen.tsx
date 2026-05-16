import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { getChapters, subjectsFor } from '../data/syllabus';
import { getQuestionsForConfig } from '../data/questions';
import type { Exam, ClassLevel, Subject, Difficulty, QuizMode, QuizConfig } from '../types';

const STEP_LABELS = ['Exam', 'Class', 'Subject', 'Chapters', 'Settings'];

export default function SetupScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useQuiz();
  const { preferences, savePreferences } = useAuth();

  const preSubject = (location.state as { preSubject?: string } | null)
    ?.preSubject as Subject | undefined;

  // Seed from saved preferences if available, otherwise use defaults
  const [step, setStep] = useState(preSubject ? 2 : 0);
  const [exam, setExam] = useState<Exam>(preferences?.exam ?? 'NEET');
  const [classLevel, setClassLevel] = useState<ClassLevel>(preferences?.classLevel ?? 'Both');
  const [subject, setSubject] = useState<Subject>(preSubject ?? preferences?.subject ?? 'Physics');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(preferences?.difficulty ?? 'Mixed');
  const [questionCount, setQuestionCount] = useState(preferences?.questionCount ?? 10);
  const [timerSeconds, setTimerSeconds] = useState(preferences?.timerSeconds ?? 90);
  const [mode, setMode] = useState<QuizMode>(preferences?.mode ?? 'Practice');

  const prefsLoaded = !!preferences && !preSubject;

  const chapters = getChapters(
    exam,
    subject,
    classLevel === 'Both' ? 'Both' : classLevel
  );

  useEffect(() => {
    setSelectedChapters([]);
  }, [subject, classLevel, exam]);

  function toggleChapter(name: string) {
    setSelectedChapters((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function startQuiz() {
    const config: QuizConfig = {
      exam,
      classLevel,
      subject,
      chapters: selectedChapters.length > 0 ? selectedChapters : chapters.map((c) => c.name),
      difficulty,
      questionCount,
      timerSeconds,
      mode,
    };
    const questions = getQuestionsForConfig(subject, config.chapters, difficulty, questionCount);
    if (questions.length === 0) {
      alert(`No questions available for ${subject}. The question bank is being expanded — try a different subject for now.`);
      return;
    }
    // Auto-save preferences for next session
    savePreferences({ exam, classLevel, subject, difficulty, questionCount, timerSeconds, mode });
    dispatch({ type: 'START_QUIZ', config, questions });
    navigate('/quiz');
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 pt-12 pb-4">
        <button
          onClick={() => (step === 0 ? navigate('/') : setStep((s) => s - 1))}
          className="text-slate-400 hover:text-white text-xl"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-slate-400 mb-1.5">
            <span className="flex items-center gap-2">
              {STEP_LABELS[step]}
              {prefsLoaded && step === 0 && (
                <span className="text-xs text-indigo-400 bg-indigo-900/40 px-1.5 py-0.5 rounded-full">
                  ✦ Preferences loaded
                </span>
              )}
            </span>
            <span>{step + 1} / {STEP_LABELS.length}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pb-6">
        {/* Step 0: Exam */}
        {step === 0 && (
          <StepSection title="Select Exam">
            {(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'] as Exam[]).map((e) => (
              <SelectCard
                key={e}
                label={e.replace('_', ' ')}
                sub={e === 'NEET' ? 'Physics, Chemistry, Biology' : 'Physics, Chemistry, Mathematics'}
                selected={exam === e}
                onClick={() => setExam(e)}
              />
            ))}
          </StepSection>
        )}

        {/* Step 1: Class */}
        {step === 1 && (
          <StepSection title="Select Class">
            {(['11', '12', 'Both'] as ClassLevel[]).map((cl) => (
              <SelectCard
                key={cl}
                label={cl === 'Both' ? 'Both Classes' : `Class ${cl}`}
                sub={cl === 'Both' ? 'Full syllabus' : `Only Class ${cl} chapters`}
                selected={classLevel === cl}
                onClick={() => setClassLevel(cl)}
              />
            ))}
          </StepSection>
        )}

        {/* Step 2: Subject */}
        {step === 2 && (
          <StepSection title="Select Subject">
            {subjectsFor(exam).map((sub) => (
              <SelectCard
                key={sub}
                label={sub}
                sub={`${exam.startsWith('JEE') && sub === 'Mathematics' ? 'JEE only' : exam === 'NEET' && sub === 'Biology' ? 'NEET only' : 'NEET + JEE'}`}
                selected={subject === sub}
                onClick={() => setSubject(sub)}
              />
            ))}
          </StepSection>
        )}

        {/* Step 3: Chapters */}
        {step === 3 && (
          <StepSection title={`Chapters — ${subject}`}>
            <p className="text-sm text-slate-400 mb-3">
              {selectedChapters.length === 0
                ? 'None selected = all chapters'
                : `${selectedChapters.length} selected`}
            </p>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {chapters.map((ch) => {
                const checked = selectedChapters.includes(ch.name);
                return (
                  <button
                    key={ch.id}
                    onClick={() => toggleChapter(ch.name)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${
                      checked
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 text-xs ${
                        checked ? 'border-primary bg-primary' : 'border-slate-500'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                    <span className="text-sm">{ch.name}</span>
                    <span className="ml-auto text-xs text-slate-500">Cl {ch.classLevel}</span>
                  </button>
                );
              })}
            </div>
          </StepSection>
        )}

        {/* Step 4: Settings */}
        {step === 4 && (
          <StepSection title="Quiz Settings">
            <div className="space-y-5">
              {/* Difficulty */}
              <SettingGroup label="Difficulty">
                <div className="grid grid-cols-4 gap-2">
                  {(['Easy', 'Medium', 'Hard', 'Mixed'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        difficulty === d
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </SettingGroup>

              {/* Question count */}
              <SettingGroup label="Questions">
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 30].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        questionCount === n
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </SettingGroup>

              {/* Timer */}
              <SettingGroup label="Timer per question">
                <div className="grid grid-cols-4 gap-2">
                  {[0, 60, 90, 120].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTimerSeconds(s)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        timerSeconds === s
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {s === 0 ? 'Off' : `${s}s`}
                    </button>
                  ))}
                </div>
              </SettingGroup>

              {/* Mode */}
              <SettingGroup label="Mode">
                <div className="grid grid-cols-2 gap-2">
                  {(['Practice', 'Mock'] as QuizMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        mode === m
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {m === 'Practice' ? '📖 Practice' : '⏱ Mock Test'}
                    </button>
                  ))}
                </div>
              </SettingGroup>
            </div>
          </StepSection>
        )}
      </main>

      {/* Bottom action */}
      <div className="px-5 pb-8">
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={startQuiz}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            🚀 Start Quiz!
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SelectCard({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-colors active:scale-95 ${
        selected
          ? 'border-primary bg-primary/10 text-white'
          : 'border-slate-700 bg-slate-800 text-slate-300'
      }`}
    >
      <div>
        <p className="font-semibold">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs ${
          selected ? 'border-primary bg-primary' : 'border-slate-500'
        }`}
      >
        {selected && '✓'}
      </span>
    </button>
  );
}

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
      {children}
    </div>
  );
}
