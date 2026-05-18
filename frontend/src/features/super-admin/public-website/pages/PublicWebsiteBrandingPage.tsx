import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useCreateThemeMutation, usePublishThemeMutation, useWebsiteThemesQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteBrandingPage() {
  const { data, isLoading } = useWebsiteThemesQuery();
  const createTheme = useCreateThemeMutation();
  const publishTheme = usePublishThemeMutation();

  const [name, setName] = useState('');
  const [themeKey, setThemeKey] = useState('');

  function submitTheme(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !themeKey.trim()) {
      return;
    }
    createTheme.mutate({
      name,
      themeKey,
      tokensJson: {
        primary: '#072A40',
        accent: '#11B5B8',
        glass: true,
        gradient: 'linear-gradient(140deg,#072A40,#0A5E7D,#11B5B8)',
      },
      typographyJson: { heading: 'Space Grotesk', body: 'Manrope' },
      effectsJson: { motion: 'smooth', buttonRadius: 14, darkMode: true },
    });
    setName('');
    setThemeKey('');
  }

  return (
    <PublicWebsiteShell
      title="Branding"
      subtitle="Control logo language, colors, typography, gradients, button styles, and motion from one centralized theme engine."
    >
      <form onSubmit={submitTheme} className="mb-6 grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Theme name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={themeKey}
          onChange={(e) => setThemeKey(e.target.value)}
          placeholder="theme-key"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Create Theme</button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading themes...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(data ?? []).map((theme) => (
            <div key={theme.id} className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{theme.name}</h3>
                <span className="text-xs text-slate-500">{theme.status}</span>
              </div>
              <p className="text-xs text-slate-500">{theme.themeKey}</p>
              <button
                onClick={() => publishTheme.mutate(theme.id)}
                className="mt-3 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Publish Theme
              </button>
            </div>
          ))}
        </div>
      )}
    </PublicWebsiteShell>
  );
}
