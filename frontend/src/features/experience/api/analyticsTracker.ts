/**
 * Client-side analytics tracker for the DSEP experience platform.
 * Events are batched (debounce 2s, max 10) and sent fire-and-forget.
 * Never fires unless consent has been given.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useExperienceStore, type AnalyticsConsentStatus } from '../store/experienceStore';

export interface TrackEvent {
  eventType: string;
  pagePath?: string;
  data?: Record<string, unknown>;
}

interface BatchedEvent extends TrackEvent {
  sessionId: string;
  visitorId: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType: string;
}

export function hasAnalyticsConsent(consentGiven: boolean, consentStatus: AnalyticsConsentStatus): boolean {
  return consentGiven || consentStatus === 'accepted';
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

async function flush(events: BatchedEvent[]) {
  if (!events.length) return;
  try {
    await fetch('/api/v1/experience/public/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // analytics failure must never degrade UX
  }
}

export function useExperienceTracker() {
  const { visitorId, sessionId, consentStatus, consentGiven, utmSource, utmMedium, utmCampaign } =
    useExperienceStore();
  const analyticsEnabled = hasAnalyticsConsent(consentGiven, consentStatus);

  const buffer = useRef<BatchedEvent[]>([]);
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyticsEnabledRef = useRef(analyticsEnabled);

  useEffect(() => {
    analyticsEnabledRef.current = analyticsEnabled;
    if (!analyticsEnabled) {
      buffer.current = [];
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }
  }, [analyticsEnabled]);

  const doFlush = useCallback(() => {
    const currentConsent = useExperienceStore.getState();
    if (
      !analyticsEnabledRef.current ||
      !hasAnalyticsConsent(currentConsent.consentGiven, currentConsent.consentStatus)
    ) {
      buffer.current = [];
      return;
    }
    if (!buffer.current.length) return;
    const batch = buffer.current.splice(0);
    flush(batch);
  }, []);

  const track = useCallback(
    (event: TrackEvent) => {
      const currentConsent = useExperienceStore.getState();
      if (
        !analyticsEnabled ||
        !hasAnalyticsConsent(currentConsent.consentGiven, currentConsent.consentStatus)
      ) {
        return;
      }

      const enriched: BatchedEvent = {
        ...event,
        sessionId,
        visitorId,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType: getDeviceType(),
        pagePath: event.pagePath ?? window.location.pathname,
      };

      buffer.current.push(enriched);

      if (buffer.current.length >= 10) {
        doFlush();
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(doFlush, 2000);
    },
    [analyticsEnabled, sessionId, visitorId, utmSource, utmMedium, utmCampaign, doFlush]
  );

  // Flush on unmount / page unload
  useEffect(() => {
    const handleUnload = () => doFlush();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      doFlush();
    };
  }, [doFlush]);

  return { track };
}
