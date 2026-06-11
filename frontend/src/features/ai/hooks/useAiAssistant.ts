import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { assistantQuery } from "../services/aiApi";
import type { AssistantMessage } from "../types/ai.types";

function messageId() {
  return Math.random().toString(36).slice(2);
}

export function useAiAssistant() {
  const { accessToken, role } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const canCallBackend = Boolean(accessToken) && role !== "GUEST";

  const sendPrompt = useCallback(
    async (prompt: string, module = "assistant") => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        return;
      }

      setLastPrompt(trimmed);
      setMessages((current) => [...current, { id: messageId(), role: "user", content: trimmed }]);
      setLoading(true);

      try {
        const response = canCallBackend
          ? await assistantQuery(accessToken as string, { prompt: trimmed, module })
          : demoAssistantResponse(role, trimmed);
        setMessages((current) => [
          ...current,
          {
            id: messageId(),
            role: "assistant",
            content: response.answer || "AI response is ready.",
            response
          }
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: messageId(),
            role: "error",
            content: error instanceof Error ? error.message : "AI assistant could not answer right now."
          }
        ]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, canCallBackend, role]
  );

  const regenerate = useCallback(async () => {
    if (lastPrompt) {
      await sendPrompt(lastPrompt);
    }
  }, [lastPrompt, sendPrompt]);

  return useMemo(
    () => ({
      messages,
      loading,
      canRegenerate: Boolean(lastPrompt) && !loading,
      canCallBackend,
      sendPrompt,
      regenerate,
      clear: () => setMessages([])
    }),
    [canCallBackend, lastPrompt, loading, messages, regenerate, sendPrompt]
  );
}
