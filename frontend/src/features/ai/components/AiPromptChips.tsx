import { Sparkles } from "lucide-react";

type AiPromptChipsProps = {
  prompts: string[];
  onPrompt: (prompt: string) => void;
};

export function AiPromptChips({ prompts, onPrompt }: AiPromptChipsProps) {
  return (
    <div className="prompt-chips" aria-label="AI quick prompts">
      {prompts.map((prompt) => (
        <button className="prompt-chip" key={prompt} type="button" onClick={() => onPrompt(prompt)}>
          <Sparkles size={14} aria-hidden="true" />
          <span>{prompt}</span>
        </button>
      ))}
    </div>
  );
}
