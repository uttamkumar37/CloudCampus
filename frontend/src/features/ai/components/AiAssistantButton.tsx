import { Bot, Sparkles } from "lucide-react";

type AiAssistantButtonProps = {
  onClick: () => void;
};

export function AiAssistantButton({ onClick }: AiAssistantButtonProps) {
  return (
    <button className="assistant-fab" type="button" onClick={onClick} aria-label="Open CloudCampus AI assistant">
      <Bot size={22} aria-hidden="true" />
      <span>AI</span>
      <Sparkles size={15} aria-hidden="true" />
    </button>
  );
}
