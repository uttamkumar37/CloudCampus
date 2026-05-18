import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resolvePublicRenderProfile } from './experienceStudioApi';

export default function RenderProfilePreview() {
  const [routePath, setRoutePath] = useState('/investors');
  const [audienceType, setAudienceType] = useState('INVESTOR');
  const [brandCode, setBrandCode] = useState('');

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ['sa:exp:render-profile', routePath, audienceType, brandCode],
    queryFn: () => resolvePublicRenderProfile({ routePath, audienceType, brandCode: brandCode || undefined }),
    enabled: false,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900">Dynamic Render Profile Preview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Validate how branding, route layout, and stakeholder journey resolve together for a public experience.
      </p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input value={routePath} onChange={(e) => setRoutePath(e.target.value)} placeholder="/investors" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input value={audienceType} onChange={(e) => setAudienceType(e.target.value.toUpperCase())} placeholder="INVESTOR" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input value={brandCode} onChange={(e) => setBrandCode(e.target.value.toUpperCase())} placeholder="Optional brand code" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <button onClick={() => refetch()} disabled={isFetching} className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isFetching ? 'Resolving...' : 'Resolve Profile'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-rose-700">Unable to resolve profile. Publish matching brand, route, and journey first.</p>
      )}

      {data && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate-500">Audience</p>
              <p className="font-semibold text-slate-900">{data.audienceType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Route</p>
              <p className="font-semibold text-slate-900">{data.routePath}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Brand</p>
              <p className="font-semibold text-slate-900">{data.brandCode}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Journey Key</p>
              <p className="font-semibold text-slate-900">{data.journeyKey}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Conversion Goal</p>
              <p className="font-semibold text-slate-900">{data.conversionGoal || '-'}</p>
            </div>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-slate-700 font-medium">Resolved JSON payload</summary>
            <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
