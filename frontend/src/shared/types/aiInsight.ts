export type AiInsightSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

export type AiInsightAudience = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface AiInsightCardContract {
  key: string;
  audience: AiInsightAudience;
  title: string;
  summary: string;
  recommendation: string;
  severity: AiInsightSeverity;
  confidence: number;
  signals: string[];
  metadata?: Record<string, unknown>;
}
