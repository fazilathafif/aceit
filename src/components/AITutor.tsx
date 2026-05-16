import { useState, useRef, useEffect } from 'react';
import { getTutorReply } from '../lib/claude';
import type { Question } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  topic: string;
  wrongQuestions: Question[];
  onClose: () => void;
}

export default function AITutor({ topic, wrongQuestions, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Tutor. I see you were working on **${topic}**.\n\nWhat would you like me to explain? You can ask about the concept, a specific question, or request a summary.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await getTutorReply(topic, wrongQuestions, messages, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    `Explain ${topic} simply`,
    'Give me a memory trick',
    'Show a solved example',
    'What are common mistakes?',
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-slate-900 rounded-t-3xl flex flex-col"
           style={{ height: '80vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-base">🤖 AI Tutor</h2>
            <p className="text-xs text-slate-400">Context: {topic}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => { setInput(p); }}
                className="flex-shrink-0 text-xs border border-slate-600 rounded-full px-3 py-1.5 text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-8 pt-2 flex gap-2 border-t border-slate-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything about this topic…"
            className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm outline-none border border-slate-700 focus:border-primary transition-colors"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-primary text-white w-11 h-11 rounded-2xl flex items-center justify-center text-lg disabled:opacity-40 active:scale-95 transition-all"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
