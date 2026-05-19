import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnalyticsConsentStatus = 'pending' | 'accepted' | 'declined';

interface ExperienceStore {
  visitorId: string;
  sessionId: string;
  consentStatus: AnalyticsConsentStatus;
  consentGiven: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  demoToken: string | null;

  giveConsent: () => void;
  declineConsent: () => void;
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
      consentStatus: 'pending',
      consentGiven: false,
      utmSource:    null,
      utmMedium:    null,
      utmCampaign:  null,
      demoToken:    null,

      giveConsent: () => set({ consentStatus: 'accepted', consentGiven: true }),
      declineConsent: () => set({ consentStatus: 'declined', consentGiven: false }),

      setUtm: (source, medium, campaign) =>
        set({ utmSource: source, utmMedium: medium, utmCampaign: campaign }),

      setDemoToken: (token) => set({ demoToken: token }),
    }),
    {
      name: 'cc-experience',
      // Only persist visitor identity after consent; never persist session-scoped state.
      partialize: (s) => ({
        consentStatus: s.consentStatus,
        consentGiven:  s.consentGiven,
        ...(s.consentGiven
          ? {
              visitorId:   s.visitorId,
              utmSource:   s.utmSource,
              utmMedium:   s.utmMedium,
              utmCampaign: s.utmCampaign,
            }
          : {}),
      }),
    }
  )
);
