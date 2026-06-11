import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { sampleRecommendations } from "../aiConfig";
import { getRecommendations, updateRecommendation } from "../services/aiApi";
import type { AiRecommendation, RecommendationAction } from "../types/ai.types";

export function useAiRecommendations() {
  const { accessToken, role } = useAuth();
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCallBackend = Boolean(accessToken) && role !== "GUEST";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!canCallBackend) {
        setRecommendations(sampleRecommendations);
        return;
      }
      const response = await getRecommendations(accessToken as string, 0, 50);
      setRecommendations(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load AI recommendations.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, canCallBackend]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    async (recommendationId: string, action: RecommendationAction) => {
      if (!canCallBackend) {
        setRecommendations((current) =>
          current.map((recommendation) =>
            recommendation.recommendationId === recommendationId
              ? { ...recommendation, status: action === "dismiss" ? "CANCELLED" : action.toUpperCase() }
              : recommendation
          )
        );
        return;
      }
      const updated = await updateRecommendation(accessToken as string, recommendationId, action);
      setRecommendations((current) =>
        current.map((recommendation) => (recommendation.recommendationId === recommendationId ? updated : recommendation))
      );
    },
    [accessToken, canCallBackend]
  );

  return useMemo(
    () => ({
      recommendations,
      loading,
      error,
      reload: load,
      updateRecommendation: act,
      demoMode: !canCallBackend
    }),
    [act, canCallBackend, error, load, loading, recommendations]
  );
}
