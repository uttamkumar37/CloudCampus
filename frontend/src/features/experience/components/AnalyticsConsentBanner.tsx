import { useLocation } from 'react-router-dom';
import { useExperienceStore } from '../store/experienceStore';

const PUBLIC_WEBSITE_PATHS = new Set([
  '/',
  '/home',
  '/features',
  '/platform',
  '/ai',
  '/investors',
  '/contact',
  '/pricing',
  '/about',
  '/demo',
]);

function isPublicWebsitePath(pathname: string) {
  return (
    PUBLIC_WEBSITE_PATHS.has(pathname) ||
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/investor/')
  );
}

export function AnalyticsConsentBanner() {
  const { pathname } = useLocation();
  const { consentGiven, consentStatus, giveConsent, declineConsent } = useExperienceStore();

  if (!isPublicWebsitePath(pathname) || consentGiven || consentStatus !== 'pending') {
    return null;
  }

  return (
    <section
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.12)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-slate-700">
          CloudCampus uses optional analytics on public pages to understand visits and improve the experience. Analytics stays off unless you accept.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={declineConsent}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={giveConsent}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}
