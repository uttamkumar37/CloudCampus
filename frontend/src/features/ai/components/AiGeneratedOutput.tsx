import { Check, Clipboard, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { AiAssistantResponse } from "../types/ai.types";
import { AiDisclaimer } from "./AiDisclaimer";

type AiGeneratedOutputProps = {
  title?: string;
  response: AiAssistantResponse | null;
  loading?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
  onUse?: () => void;
};

async function copyText(text: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

export function AiGeneratedOutput({ title = "Generated output", response, loading, error, onRegenerate, onUse }: AiGeneratedOutputProps) {
  const [copied, setCopied] = useState(false);
  const text = response?.answer || "";

  async function onCopy() {
    if (!text) {
      return;
    }
    await copyText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (loading) {
    return (
      <section className="output-panel" aria-live="polite">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--short" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="output-panel output-panel--error">
        <h3>{title}</h3>
        <p>{error}</p>
      </section>
    );
  }

  if (!response) {
    return (
      <section className="output-panel output-panel--empty">
        <h3>{title}</h3>
        <p>Generated content will appear here after you submit the form.</p>
        <AiDisclaimer compact />
      </section>
    );
  }

  return (
    <section className="output-panel">
      <div className="output-panel__header">
        <div>
          <h3>{title}</h3>
          <p>Review before sharing or saving.</p>
        </div>
        <div className="button-row">
          <button className="icon-button" type="button" onClick={onCopy} disabled={!text}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {onRegenerate ? (
            <button className="icon-button" type="button" onClick={onRegenerate}>
              <RotateCcw size={16} aria-hidden="true" />
              <span>Regenerate</span>
            </button>
          ) : null}
          {onUse ? (
            <button className="secondary-button" type="button" onClick={onUse}>
              <Check size={16} aria-hidden="true" />
              <span>Use this</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="generated-answer">{response.answer}</div>

      {response.highlights?.length ? (
        <div className="output-columns">
          <div>
            <h4>Highlights</h4>
            <ul>
              {response.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Recommended actions</h4>
            <ul>
              {(response.recommendedActions || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <AiDisclaimer compact />
    </section>
  );
}
