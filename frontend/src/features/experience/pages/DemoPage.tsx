import { useState } from 'react';
import { useDemoScenarios, useStartDemo, type DemoScenario, type DemoSessionResult } from '../api/experienceApi';
import { useExperienceStore } from '../store/experienceStore';

export default function DemoPage() {
  const { data: scenarios, isLoading } = useDemoScenarios();
  const { mutate: startDemo, isPending } = useStartDemo();
  const { utmSource, utmMedium, utmCampaign } = useExperienceStore();

  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [email, setEmail] = useState('');
  const [session, setSession] = useState<DemoSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    if (!selectedScenario) return;
    setError(null);
    startDemo(
      { scenarioSlug: selectedScenario.slug, email: email || undefined, utmSource, utmMedium, utmCampaign },
      {
        onSuccess: (data) => setSession(data),
        onError: () => setError('Failed to start demo. Please try again.'),
      }
    );
  }

  if (session) {
    return <DemoReady session={session} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
            Interactive Demo
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See CloudCampus in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pick a school profile. We'll create a real, isolated demo environment just for you —
            no shared sandbox, no fake data.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-52" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {(scenarios ?? []).map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                selected={selectedScenario?.id === scenario.id}
                onSelect={() => setSelectedScenario(scenario)}
              />
            ))}
          </div>
        )}

        {selectedScenario && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Starting: {selectedScenario.name}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Session lasts {selectedScenario.sessionTtlMin} minutes. No credit card required.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your email (optional — we'll send login details)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <button
              onClick={handleStart}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {isPending ? 'Setting up your demo…' : 'Launch My Demo →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: DemoScenario;
  selected: boolean;
  onSelect: () => void;
}) {
  const profile = scenario.schoolProfile as Record<string, string>;
  return (
    <button
      onClick={onSelect}
      className={`text-left bg-white rounded-2xl p-6 shadow transition border-2 hover:shadow-md ${
        selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent'
      }`}
    >
      <div className="text-3xl mb-3">{profile.type === 'IB' ? '🌍' : profile.boarding ? '🏫' : '🏛️'}</div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{scenario.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{scenario.description}</p>
      <div className="flex flex-wrap gap-1">
        {scenario.features.slice(0, 3).map((f) => (
          <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {f.replace(/_/g, ' ')}
          </span>
        ))}
        {scenario.features.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            +{scenario.features.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

function DemoReady({ session }: { session: DemoSessionResult }) {
  const expiresAt = new Date(session.expiresAt).toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your demo is ready!</h1>
        <p className="text-gray-500 mb-6 text-sm">Session expires at {expiresAt}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Username</span>
            <p className="font-mono text-sm text-gray-800">{session.demoUsername}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Password</span>
            <p className="font-mono text-sm text-gray-800">{session.demoPassword}</p>
          </div>
        </div>

        <a
          href={session.loginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Open CloudCampus Demo →
        </a>
      </div>
    </div>
  );
}
