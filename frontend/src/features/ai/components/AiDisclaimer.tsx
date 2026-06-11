import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { reviewDisclaimer } from "../aiConfig";

export function AiDisclaimer({ compact = false }: { compact?: boolean }) {
  const { role } = useAuth();

  return (
    <div className={compact ? "ai-disclaimer ai-disclaimer--compact" : "ai-disclaimer"}>
      <ShieldAlert size={16} aria-hidden="true" />
      <span>{reviewDisclaimer(role)}</span>
    </div>
  );
}
