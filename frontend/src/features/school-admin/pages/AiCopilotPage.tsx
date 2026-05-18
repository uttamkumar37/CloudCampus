import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryAiCopilot } from '../api/aiCopilotApi';
import type { CopilotQueryResponse } from '../api/aiCopilotApi';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  tokensUsed?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "Summarize today's attendance",
  'Which students have fee dues?',
  'List upcoming exams',
  'Show low attendance students',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm text-white shadow-sm">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({
  text,
  tokensUsed,
}: {
  text: string;
  tokensUsed?: number;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-sm whitespace-pre-wrap">
        {text}
      </div>
      {tokensUsed !== undefined && tokensUsed > 0 && (
        <span className="ml-1 text-xs text-gray-400">
          Tokens used: {tokensUsed}
        </span>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AiCopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [error, setError]       = useState<string | null>(null);
  const msgCounter              = useRef(0);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const { mutate: ask, isPending } = useMutation<
    CopilotQueryResponse,
    Error,
    string
  >({
    retry: false,
    mutationFn: (question: string) =>
      queryAiCopilot({ question }),
    onMutate: (question) => {
      setError(null);
      appendMessage({ role: 'user', text: question });
    },
    onSuccess: (res) => {
      appendMessage({ role: 'assistant', text: res.answer, tokensUsed: res.tokensUsed });
      scrollToBottom();
    },
    onError: (err) => {
      setError(err.message ?? 'Something went wrong. Please try again.');
    },
  });

  function appendMessage(msg: Omit<ChatMessage, 'id'>) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: ++msgCounter.current },
    ]);
    scrollToBottom();
  }

  function scrollToBottom() {
    // Use rAF so the DOM has painted before scrolling.
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function handleSubmit(question: string) {
    const q = question.trim();
    if (!q || isPending) return;
    setInput('');
    ask(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  }

  function handleExport() {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const label = m.role === 'user' ? 'You' : 'AI Copilot';
      const tokens =
        m.role === 'assistant' && m.tokensUsed && m.tokensUsed > 0
          ? ` [tokens: ${m.tokensUsed}]`
          : '';
      return `${label}${tokens}:\n${m.text}`;
    });
    const blob = new Blob([lines.join('\n\n---\n\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ai-copilot-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Copilot</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Ask questions about your school — attendance, fees, exams, and more.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleExport}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Export conversation
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Chat card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Suggested questions — shown only when no conversation yet */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 py-10">
            <div className="text-center">
              <div className="mb-2 text-4xl select-none">✦</div>
              <p className="text-sm font-medium text-gray-600">
                What would you like to know?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  disabled={isPending}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message history */}
        {!isEmpty && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserBubble key={msg.id} text={msg.text} />
              ) : (
                <AssistantBubble
                  key={msg.id}
                  text={msg.text}
                  tokensUsed={msg.tokensUsed}
                />
              ),
            )}
            {isPending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Suggested chips above input when conversation exists */}
        {!isEmpty && (
          <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-4 pt-2 pb-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSubmit(q)}
                disabled={isPending}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={isPending}
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 transition-colors"
            />
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isPending}
              className="flex h-10 w-16 items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {isPending ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                'Ask'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
