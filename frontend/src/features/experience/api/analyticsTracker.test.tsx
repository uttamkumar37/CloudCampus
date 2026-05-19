import { act, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { hasAnalyticsConsent, useExperienceTracker } from './analyticsTracker';
import { useExperienceStore } from '../store/experienceStore';

describe('analyticsTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useExperienceStore.setState({
      visitorId: 'visitor-test',
      sessionId: 'session-test',
      consentStatus: 'pending',
      consentGiven: false,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      demoToken: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('allows analytics only after explicit consent', () => {
    expect(hasAnalyticsConsent(false, 'pending')).toBe(false);
    expect(hasAnalyticsConsent(false, 'declined')).toBe(false);
    expect(hasAnalyticsConsent(false, 'accepted')).toBe(true);
    expect(hasAnalyticsConsent(true, 'pending')).toBe(true);
  });

  it('does not send analytics before consent', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useExperienceTracker());

    act(() => {
      result.current.track({ eventType: 'PAGE_VIEW', pagePath: '/demo' });
      vi.advanceTimersByTime(2100);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends analytics after consent', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal('fetch', fetchMock);
    useExperienceStore.getState().giveConsent();

    const { result } = renderHook(() => useExperienceTracker());

    act(() => {
      result.current.track({ eventType: 'PAGE_VIEW', pagePath: '/demo' });
      vi.advanceTimersByTime(2100);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/experience/public/events',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      })
    );
  });

  it('drops buffered events when consent is declined before flush', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal('fetch', fetchMock);
    useExperienceStore.getState().giveConsent();

    const { result } = renderHook(() => useExperienceTracker());

    act(() => {
      result.current.track({ eventType: 'PAGE_VIEW', pagePath: '/demo' });
      useExperienceStore.getState().declineConsent();
      vi.advanceTimersByTime(2100);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
