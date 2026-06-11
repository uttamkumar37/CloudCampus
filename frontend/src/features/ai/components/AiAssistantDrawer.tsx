import { Check, Clipboard, Eraser, RotateCcw, Send, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { quickPromptsByRole, reviewDisclaimer } from "../aiConfig";
import { useAiAssistant } from "../hooks/useAiAssistant";
import { AiPromptChips } from "./AiPromptChips";

type AiAssistantDrawerProps = {
  open: boolean;
  onClose: () => void;
};

async function copyText(text: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

export function AiAssistantDrawer({ open, onClose }: AiAssistantDrawerProps) {
  const { role, authenticated } = useAuth();
  const { messages, loading, canRegenerate, canCallBackend, sendPrompt, regenerate, clear } = useAiAssistant();
  const [prompt, setPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    function onPrompt(event: Event) {
      const promptText = (event as CustomEvent<string>).detail;
      if (promptText) {
        void sendPrompt(promptText);
      }
    }
    window.addEventListener("cloudcampus:assistant-prompt", onPrompt);
    return () => window.removeEventListener("cloudcampus:assistant-prompt", onPrompt);
  }, [sendPrompt]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPrompt = prompt.trim();
    if (!nextPrompt) {
      return;
    }
    setPrompt("");
    await sendPrompt(nextPrompt);
  }

  async function copyMessage(id: string, text: string) {
    await copyText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  return (
    <>
      {open ? <button className="assistant-scrim" type="button" aria-label="Close AI assistant" onClick={onClose} /> : null}
      <aside
        className={open ? "assistant-drawer assistant-drawer--open" : "assistant-drawer"}
        aria-hidden={!open}
        aria-modal={open}
        aria-labelledby="assistant-title"
        role="dialog"
      >
      <div className="assistant-drawer__header">
        <div>
          <p className="eyebrow">CloudCampus AI</p>
          <h2 id="assistant-title">{role.replaceAll("_", " ")} assistant</h2>
        </div>
        <button className="icon-only" type="button" onClick={onClose} aria-label="Close AI assistant">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="assistant-drawer__body">
        <section className="assistant-welcome">
          <p>
            {authenticated
              ? "Ask for a summary, draft, or next step. CloudCampus keeps answers aligned with your role."
              : "Try safe sample prompts, then sign in to use your school workspace."}
          </p>
          {!canCallBackend ? <span className="status-pill status-pill--demo">Demo prompts</span> : null}
        </section>

        <AiPromptChips prompts={quickPromptsByRole[role]} onPrompt={(nextPrompt) => void sendPrompt(nextPrompt)} />

        <div className="assistant-messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">
              <strong>Start with a quick prompt or ask your own question.</strong>
              <span>{reviewDisclaimer(role)}</span>
            </div>
          ) : (
            messages.map((message) => (
              <article className={`assistant-message assistant-message--${message.role}`} key={message.id}>
                <div className="assistant-message__content">{message.content}</div>
                {message.response?.highlights?.length ? (
                  <ul className="assistant-message__bullets">
                    {message.response.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {message.response?.quickActions?.length ? (
                  <div className="assistant-message__actions">
                    {message.response.quickActions.map((action) => (
                      <button key={action.label} type="button" onClick={() => void sendPrompt(action.prompt)}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" ? (
                  <button className="message-copy" type="button" onClick={() => void copyMessage(message.id, message.content)}>
                    {copiedId === message.id ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}
                    <span>{copiedId === message.id ? "Copied" : "Copy response"}</span>
                  </button>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>

      <form className="assistant-compose" onSubmit={onSubmit}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask CloudCampus AI..."
          rows={3}
        />
        <div className="assistant-compose__actions">
          <button className="icon-button" type="button" onClick={clear} disabled={!messages.length || loading}>
            <Eraser size={16} aria-hidden="true" />
            <span>Clear</span>
          </button>
          <button className="icon-button" type="button" onClick={() => void regenerate()} disabled={!canRegenerate}>
            <RotateCcw size={16} aria-hidden="true" />
            <span>Regenerate</span>
          </button>
          <button className="primary-button" type="submit" disabled={loading || !prompt.trim()}>
            <Send size={16} aria-hidden="true" />
            <span>{loading ? "Thinking" : "Send"}</span>
          </button>
        </div>
        <small>{reviewDisclaimer(role)}</small>
      </form>
    </aside>
    </>
  );
}
