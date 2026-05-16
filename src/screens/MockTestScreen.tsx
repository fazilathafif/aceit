import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { QUESTION_BANK } from '../data/questions';
import { MOCK_CONFIGS } from '../data/syllabus';
import { getToday } from '../lib/gameUtils';
import OMRSheet from '../components/OMRSheet';
import type { Question, MockResult, MockSectionConfig, Subject } from '../types';

const MOCK_SESSION_KEY = 'aceit_mock_session';

function pickSectionQuestions(subject: Subject, needed: number): Question[] {
  const pool = QUESTION_BANK.filter((q) => q.subject === subject);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  // Repeat if needed
  const result: Question[] = [];
  while (result.length < needed) {
    result.push(...shuffled.slice(0, needed - result.length));
  }
  return result.slice(0, needed);
}

export default function MockTestScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeMockTest } = useGame();

  const exam = user?.exam ?? 'JEE_MAIN';
  const config = MOCK_CONFIGS[exam] ?? MOCK_CONFIGS['JEE_MAIN'];

  // Build flat question list grouped by section
  const [allQuestions] = useState<Question[]>(() =>
    config.sections.flatMap((s) => pickSectionQuestions(s.subject, s.questionCount))
  );

  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(allQuestions.length).fill(null)
  );
  const [flagged, setFlagged] = useState<boolean[]>(() =>
    new Array(allQuestions.length).fill(false)
  );

  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionInSection, setQuestionInSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.totalMinutes * 60);
  const [showOMR, setShowOMR] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const startTime = useRef(Date.now());

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Section offsets
  const sectionOffsets = config.sections.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + config.sections[i - 1].questionCount);
    return acc;
  }, []);

  const globalIdx = sectionOffsets[sectionIdx] + questionInSection;
  const currentSection: MockSectionConfig = config.sections[sectionIdx];
  const sectionQ = allQuestions.slice(
    sectionOffsets[sectionIdx],
    sectionOffsets[sectionIdx] + currentSection.questionCount
  );
  const q = sectionQ[questionInSection];

  function selectAnswer(optIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[globalIdx] = next[globalIdx] === optIdx ? null : optIdx;
      return next;
    });
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = [...prev];
      next[globalIdx] = !next[globalIdx];
      return next;
    });
  }

  function goTo(idx: number) {
    let remaining = idx;
    for (let si = 0; si < config.sections.length; si++) {
      if (remaining < config.sections[si].questionCount) {
        setSectionIdx(si);
        setQuestionInSection(remaining);
        return;
      }
      remaining -= config.sections[si].questionCount;
    }
  }

  function handleSubmit() {
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const sectionScores = config.sections.map((sec, si) => {
      const offset = sectionOffsets[si];
      let correct = 0, wrong = 0, skipped = 0;
      for (let qi = 0; qi < sec.questionCount; qi++) {
        const ans = answers[offset + qi];
        const q = allQuestions[offset + qi];
        if (ans === null) { skipped++; }
        else if (ans === q.correctIndex) { correct++; }
        else { wrong++; }
      }
      const score = correct * sec.correct + wrong * sec.wrong;
      return { subject: sec.subject, score, maxScore: sec.questionCount * sec.correct, correct, wrong, skipped };
    });
    const totalScore = sectionScores.reduce((s, r) => s + r.score, 0);
    const maxScore = sectionScores.reduce((s, r) => s + r.maxScore, 0);
    const result: MockResult = { exam: config.exam, date: getToday(), timeTaken, sectionScores, totalScore, maxScore };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(result));
    completeMockTest(totalScore);
    navigate('/mock-results');
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft < 300 ? 'text-red-400' : timeLeft < 900 ? 'text-yellow-400' : 'text-green-400';
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Top bar */}
      <header className="px-4 pt-8 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500">{answeredCount}/{allQuestions.length} answered</span>
          <span className={`text-xl font-bold tabular-nums ${timerColor}`}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <button
            onClick={() => setShowOMR(true)}
            className="text-xs text-indigo-400 font-medium border border-indigo-700/50 px-2 py-1 rounded-lg"
          >
            Answer Sheet
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {config.sections.map((sec, si) => {
            const offset = sectionOffsets[si];
            const secAnswered = answers.slice(offset, offset + sec.questionCount).filter((a) => a !== null).length;
            return (
              <button
                key={sec.subject}
                onClick={() => { setSectionIdx(si); setQuestionInSection(0); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  si === sectionIdx
                    ? 'bg-primary text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sec.subject} ({secAnswered}/{sec.questionCount})
              </button>
            );
          })}
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500">Q{questionInSection + 1} of {currentSection.questionCount}</span>
          <button
            onClick={toggleFlag}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              flagged[globalIdx]
                ? 'bg-yellow-700/40 border-yellow-600 text-yellow-300'
                : 'border-slate-700 text-slate-500'
            }`}
          >
            🚩 {flagged[globalIdx] ? 'Flagged' : 'Flag'}
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 mb-4 flex-shrink-0">
          <p className="text-sm leading-relaxed">{q.text}</p>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                answers[globalIdx] === i
                  ? 'bg-primary/20 border-primary text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <span className="font-bold mr-2 text-slate-500">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          ))}
        </div>
      </main>

      {/* Bottom nav */}
      <footer className="px-4 pb-6 pt-3 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => {
            if (questionInSection > 0) setQuestionInSection((q) => q - 1);
            else if (sectionIdx > 0) {
              setSectionIdx((s) => s - 1);
              setQuestionInSection(config.sections[sectionIdx - 1].questionCount - 1);
            }
          }}
          disabled={sectionIdx === 0 && questionInSection === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium disabled:opacity-30"
        >
          ← Prev
        </button>
        <button
          onClick={() => {
            if (questionInSection < currentSection.questionCount - 1) setQuestionInSection((q) => q + 1);
            else if (sectionIdx < config.sections.length - 1) {
              setSectionIdx((s) => s + 1);
              setQuestionInSection(0);
            }
          }}
          disabled={sectionIdx === config.sections.length - 1 && questionInSection === currentSection.questionCount - 1}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium disabled:opacity-30"
        >
          Next →
        </button>
        <button
          onClick={() => setShowSubmitConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-bold"
        >
          Submit
        </button>
      </footer>

      {showOMR && (
        <OMRSheet
          questions={allQuestions}
          answers={answers}
          flagged={flagged}
          currentGlobal={globalIdx}
          onJump={goTo}
          onClose={() => setShowOMR(false)}
        />
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <p className="font-bold text-lg mb-1">Submit Paper?</p>
            <p className="text-slate-400 text-sm mb-1">
              {answeredCount}/{allQuestions.length} questions answered.
            </p>
            {answeredCount < allQuestions.length && (
              <p className="text-yellow-400 text-xs mb-4">
                {allQuestions.length - answeredCount} unanswered — these will score 0.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
