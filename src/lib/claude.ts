/**
 * Claude API integration hooks
 *
 * Set VITE_ANTHROPIC_API_KEY in .env.local to enable live AI features.
 * Each function works in stub mode (returns canned responses) without a key.
 */

import type { Question, QuizConfig, AnswerRecord, WeakTopic } from '../types';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
const MODEL = 'claude-sonnet-4-6';

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  if (!API_KEY) {
    console.warn('[AceIt] No VITE_ANTHROPIC_API_KEY — using stub response.');
    return '__stub__';
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ─── Hook 1: Generate questions for a quiz config ─────────────────────────────
export async function generateQuestions(
  config: QuizConfig,
  count: number
): Promise<Question[]> {
  const system = `You are an expert NEET/JEE question setter.
Return ONLY a valid JSON array of question objects — no markdown, no prose.
Each object: { id, text, options: string[4], correctIndex: 0-3, explanation, chapter, subject, difficulty, classLevel }.`;

  const user = `Generate ${count} MCQ questions for:
Exam: ${config.exam}
Subject: ${config.subject}
Chapters: ${config.chapters.join(', ')}
Class: ${config.classLevel}
Difficulty: ${config.difficulty}`;

  const raw = await callClaude(system, user);
  if (raw === '__stub__') return [];

  try {
    return JSON.parse(raw) as Question[];
  } catch {
    console.error('[AceIt] Failed to parse Claude question response');
    return [];
  }
}

// ─── Hook 2: Explain why an answer is correct/incorrect ──────────────────────
export async function getAnswerExplanation(
  question: Question,
  chosenIndex: number | null
): Promise<string> {
  const chosen =
    chosenIndex !== null ? question.options[chosenIndex] : 'Skipped (timed out)';
  const correct = question.options[question.correctIndex];

  const system = `You are a friendly NEET/JEE tutor. Give a clear, concise explanation (3-5 sentences max).
Use simple language. Mention the concept name. No markdown headers.`;

  const user = `Question: ${question.text}
Student answered: ${chosen}
Correct answer: ${correct}

Explain why the correct answer is right and (if wrong) why the student's choice is incorrect.`;

  const raw = await callClaude(system, user);
  if (raw === '__stub__') return question.explanation;
  return raw;
}

// ─── Hook 3: AI Tutor chat reply ─────────────────────────────────────────────
export async function getTutorReply(
  topic: string,
  wrongQuestions: Question[],
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const system = `You are AceIt AI Tutor — a supportive, knowledgeable NEET/JEE mentor.
Topic context: ${topic}.
Student recently struggled with: ${wrongQuestions.map((q) => q.text).join(' | ')}.
Explain clearly, use examples, encourage the student. Keep replies concise (≤ 150 words unless asked for more).`;

  if (!API_KEY) {
    return `Great question! Let me explain **${topic}** step by step.\n\nThis is a stub response — add VITE_ANTHROPIC_API_KEY to .env.local for live AI tutoring.`;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system,
      messages: [
        ...chatHistory,
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "I couldn't generate a response. Please try again.";
}

// ─── Hook 5: Generate a week-by-week study path ───────────────────────────────
export async function generateStudyPath(
  exam: string,
  daysLeft: number,
  weakChapters: { chapter: string; subject: string; mastery: number }[],
  subjectAccuracy: { subject: string; accuracy: number }[]
): Promise<string> {
  const system = `You are an expert NEET/JEE study planner. Create a week-by-week study schedule.
Return a short markdown plan (max 250 words). Use ## Week headers, bullet points for chapters.
Prioritise weak chapters. Be specific and motivating.`;

  const user = `Exam: ${exam}
Days remaining: ${daysLeft}
Weak chapters (lowest mastery first):
${weakChapters.slice(0, 10).map((c) => `- ${c.subject}/${c.chapter} (${c.mastery}% mastery)`).join('\n')}
Subject accuracy: ${subjectAccuracy.map((s) => `${s.subject}: ${s.accuracy}%`).join(', ')}

Generate a ${Math.ceil(daysLeft / 7)}-week study schedule prioritising the weakest chapters.`;

  const raw = await callClaude(system, user);
  if (raw === '__stub__') {
    const weeks = Math.min(Math.ceil(daysLeft / 7), 4);
    const chunks = weakChapters.slice(0, weeks * 2);
    return Array.from({ length: weeks }, (_, i) => {
      const batch = chunks.slice(i * 2, i * 2 + 2);
      return `## Week ${i + 1}\n${batch.map((c) => `- **${c.chapter}** (${c.subject}) — review theory + 10 practice Qs`).join('\n') || '- Consolidation & revision of all topics'}`;
    }).join('\n\n') + '\n\n_(Add VITE_ANTHROPIC_API_KEY for an AI-personalised plan)_';
  }
  return raw;
}

export async function getStudyPlan(
  weakTopics: WeakTopic[],
  answers: AnswerRecord[],
  config: QuizConfig
): Promise<string> {
  const accuracy = Math.round(
    (answers.filter((a) => a.isCorrect).length / answers.length) * 100
  );

  const system = `You are a NEET/JEE study coach. Create a short, actionable study plan.
Use bullet points. Max 200 words.`;

  const user = `Student results:
Exam: ${config.exam} | Subject: ${config.subject} | Accuracy: ${accuracy}%
Weak topics: ${weakTopics.map((w) => `${w.chapter} (${w.wrong}/${w.total} wrong)`).join(', ')}

Suggest: what to revise, in what order, and 1-2 specific tips per weak topic.`;

  const raw = await callClaude(system, user);
  if (raw === '__stub__')
    return `📌 Focus areas for **${config.subject}**:\n${weakTopics
      .map((w) => `• **${w.chapter}** — review theory, solve 10 practice questions`)
      .join('\n')}\n\n_(Add VITE_ANTHROPIC_API_KEY for a personalised AI plan)_`;
  return raw;
}
