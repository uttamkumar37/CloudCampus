import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExperienceStore {
  visitorId: string;
  sessionId: string;
  consentGiven: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  demoToken: string | null;

  giveConsent: () => void;
  setUtm: (source: string | null, medium: string | null, campaign: string | null) => void;
  setDemoToken: (token: string) => void;
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set) => ({
      visitorId:    generateId('v'),
      sessionId:    generateId('s'),
      consentGiven: false,
      utmSource:    null,
      utmMedium:    null,
      utmCampaign:  null,
      demoToken:    null,

      giveConsent: () => set({ consentGiven: true }),

      setUtm: (source, medium, campaign) =>
        set({ utmSource: source, utmMedium: medium, utmCampaign: campaign }),

      setDemoToken: (token) => set({ demoToken: token }),
    }),
    {
      name: 'cc-experience',
      // Only persist visitor identity and consent — never session-scoped state
      partialize: (s) => ({
        visitorId:    s.visitorId,
        consentGiven: s.consentGiven,
        utmSource:    s.utmSource,
        utmMedium:    s.utmMedium,
        utmCampaign:  s.utmCampaign,
      }),
    }
  )
);
