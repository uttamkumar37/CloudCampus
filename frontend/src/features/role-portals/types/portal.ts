export type PortalTone = 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';

export interface PortalInsight {
  title: string;
  summary: string;
  recommendation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO';
  confidence: number;
}

export interface PortalTimelineItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  occurredAt?: string | null;
}

export interface PortalQuickAction {
  label: string;
  to?: string;
  disabled?: boolean;
  hint?: string;
}
