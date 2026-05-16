import type { Chapter, Subject, MockConfig } from '../types';

type SyllabusMap = Record<string, Chapter[]>;

const make = (
  subject: Subject,
  classLevel: '11' | '12',
  names: string[]
): Chapter[] =>
  names.map((name) => ({
    id: `${subject.toLowerCase()}_${classLevel}_${name.toLowerCase().replace(/\W+/g, '_')}`,
    name,
    subject,
    classLevel,
  }));

export const SYLLABUS: SyllabusMap = {
  // ─── NEET ─────────────────────────────────────────────────────────────────
  NEET_Physics_11: make('Physics', '11', [
    'Physical World and Measurement',
    'Kinematics',
    'Laws of Motion',
    'Work, Energy and Power',
    'Motion of System of Particles and Rigid Body',
    'Gravitation',
    'Properties of Bulk Matter',
    'Thermodynamics',
    'Behaviour of Perfect Gas and Kinetic Theory',
    'Oscillations and Waves',
  ]),
  NEET_Physics_12: make('Physics', '12', [
    'Electrostatics',
    'Current Electricity',
    'Magnetic Effects of Current and Magnetism',
    'Electromagnetic Induction and Alternating Currents',
    'Electromagnetic Waves',
    'Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms and Nuclei',
    'Electronic Devices',
  ]),
  NEET_Chemistry_11: make('Chemistry', '11', [
    'Some Basic Concepts of Chemistry',
    'Structure of Atom',
    'Classification of Elements and Periodicity',
    'Chemical Bonding and Molecular Structure',
    'States of Matter: Gases and Liquids',
    'Thermodynamics',
    'Equilibrium',
    'Redox Reactions',
    'Hydrogen',
    's-Block Elements',
    'Some p-Block Elements',
    'Organic Chemistry — Basic Principles and Techniques',
    'Hydrocarbons',
    'Environmental Chemistry',
  ]),
  NEET_Chemistry_12: make('Chemistry', '12', [
    'Solid State',
    'Solutions',
    'Electrochemistry',
    'Chemical Kinetics',
    'Surface Chemistry',
    'General Principles of Isolation of Elements',
    'p-Block Elements',
    'd and f Block Elements',
    'Coordination Compounds',
    'Haloalkanes and Haloarenes',
    'Alcohols, Phenols and Ethers',
    'Aldehydes, Ketones and Carboxylic Acids',
    'Organic Compounds Containing Nitrogen',
    'Biomolecules',
    'Polymers',
    'Chemistry in Everyday Life',
  ]),
  NEET_Biology_11: make('Biology', '11', [
    'Diversity in Living World',
    'Structural Organisation in Animals and Plants',
    'Cell Structure and Function',
    'Plant Physiology',
    'Human Physiology',
  ]),
  NEET_Biology_12: make('Biology', '12', [
    'Reproduction',
    'Genetics and Evolution',
    'Biology and Human Welfare',
    'Biotechnology and Its Applications',
    'Ecology and Environment',
  ]),
  // ─── JEE Math (same for Main & Advanced) ──────────────────────────────────
  JEE_Mathematics_11: make('Mathematics', '11', [
    'Sets, Relations and Functions',
    'Complex Numbers and Quadratic Equations',
    'Matrices and Determinants',
    'Permutations and Combinations',
    'Mathematical Induction',
    'Binomial Theorem',
    'Sequences and Series',
    'Limits, Continuity and Differentiability',
    'Integral Calculus',
    'Differential Equations',
    'Coordinate Geometry',
    'Three Dimensional Geometry',
    'Vector Algebra',
    'Statistics and Probability',
    'Trigonometry',
  ]),
  JEE_Mathematics_12: make('Mathematics', '12', [
    'Relations and Functions',
    'Inverse Trigonometric Functions',
    'Matrices',
    'Determinants',
    'Continuity and Differentiability',
    'Applications of Derivatives',
    'Integrals',
    'Applications of Integrals',
    'Differential Equations',
    'Vectors',
    'Three Dimensional Geometry',
    'Linear Programming',
    'Probability',
  ]),
};

export function getChapters(
  exam: string,
  subject: Subject,
  classLevel: '11' | '12' | 'Both'
): Chapter[] {
  const levels: Array<'11' | '12'> =
    classLevel === 'Both' ? ['11', '12'] : [classLevel];

  // Biology is NEET-only; Mathematics is JEE-only
  const prefix =
    subject === 'Biology' || subject === 'Mathematics'
      ? subject === 'Biology'
        ? 'NEET'
        : 'JEE'
      : exam.startsWith('JEE')
      ? 'NEET'   // Physics/Chemistry share syllabus; we store under NEET keys
      : 'NEET';

  return levels.flatMap(
    (cl) => SYLLABUS[`${prefix}_${subject}_${cl}`] ?? []
  );
}

export const EXAMS = ['NEET', 'JEE_MAIN', 'JEE_ADVANCED'] as const;

export const MOCK_CONFIGS: Record<string, MockConfig> = {
  JEE_MAIN: {
    exam: 'JEE_MAIN',
    totalMinutes: 180,
    sections: [
      { subject: 'Physics',     questionCount: 30, correct: 4, wrong: -1 },
      { subject: 'Chemistry',   questionCount: 30, correct: 4, wrong: -1 },
      { subject: 'Mathematics', questionCount: 30, correct: 4, wrong: -1 },
    ],
  },
  JEE_ADVANCED: {
    exam: 'JEE_ADVANCED',
    totalMinutes: 180,
    sections: [
      { subject: 'Physics',     questionCount: 20, correct: 4, wrong: -2 },
      { subject: 'Chemistry',   questionCount: 20, correct: 4, wrong: -2 },
      { subject: 'Mathematics', questionCount: 20, correct: 4, wrong: -2 },
    ],
  },
  NEET: {
    exam: 'NEET',
    totalMinutes: 200,
    sections: [
      { subject: 'Physics',   questionCount: 45, correct: 4, wrong: -1 },
      { subject: 'Chemistry', questionCount: 45, correct: 4, wrong: -1 },
      { subject: 'Biology',   questionCount: 90, correct: 4, wrong: -1 },
    ],
  },
};

export function subjectsFor(exam: string): Subject[] {
  if (exam === 'NEET') return ['Physics', 'Chemistry', 'Biology'];
  return ['Physics', 'Chemistry', 'Mathematics'];
}
