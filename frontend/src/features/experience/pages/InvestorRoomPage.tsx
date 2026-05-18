import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInvestorRoom, useVerifyInvestorAccess, type InvestorRoomSection } from '../api/experienceApi';

export default function InvestorRoomPage() {
  const { roomCode = '' } = useParams<{ roomCode: string }>();
  const { data: room, isLoading, isError } = useInvestorRoom(roomCode);

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { mutate: verifyAccess, isPending } = useVerifyInvestorAccess(roomCode);

  function handleUnlock() {
    setAuthError(null);
    verifyAccess(
      { password },
      {
        onSuccess: ({ granted }) => {
          if (granted) setUnlocked(true);
          else setAuthError('Incorrect password. Please try again.');
        },
        onError: () => setAuthError('Verification failed. Please try again.'),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse text-gray-400 text-lg">Loading investor room…</div>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-gray-400">This investor room may have expired or the link is invalid.</p>
        </div>
      </div>
    );
  }

  if (room.accessMode === 'PASSWORD' && !unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-sm w-full text-center border border-gray-800">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold text-white mb-1">{room.title}</h1>
          <p className="text-gray-400 text-sm mb-6">This room is password protected.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter access code"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleUnlock}
            disabled={isPending || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {isPending ? 'Verifying…' : 'Unlock Room'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-8 py-5 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">CloudCampus · Investor Room</p>
          <h1 className="text-xl font-bold">{room.title}</h1>
        </div>
        {room.expiresAt && (
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            Expires {new Date(room.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 space-y-10">
        {room.sections.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-4xl mb-4">📊</p>
            <p>Room content is being prepared.</p>
          </div>
        ) : (
          room.sections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))
        )}
      </main>
    </div>
  );
}

function SectionBlock({ section }: { section: InvestorRoomSection }) {
  const c = section.content;

  return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
      {c.title && (
        <h2 className="text-lg font-bold text-white mb-1">{c.title as string}</h2>
      )}
      {c.subtitle && (
        <p className="text-sm text-gray-400 mb-6">{c.subtitle as string}</p>
      )}

      {section.sectionType === 'METRICS_DASHBOARD' && <MetricsGrid metrics={c.metrics as MetricItem[]} />}
      {section.sectionType === 'TRACTION' && <TractionSection content={c} />}
      {section.sectionType === 'FINANCIALS' && <FinancialsSection content={c} />}
      {section.sectionType === 'TEAM' && <TeamSection content={c} />}
      {section.sectionType === 'PRODUCT_DEMO' && <ProductSection content={c} />}
      {section.sectionType === 'FAQ' && <FaqSection content={c} />}
      {section.sectionType === 'CUSTOM' && (
        <p className="text-gray-300 whitespace-pre-line leading-relaxed">{c.body as string}</p>
      )}
    </div>
  );
}

// ── Section renderers ─────────────────────────────────────────────────────────

interface MetricItem { label: string; value: string; delta?: string; trend?: string; color?: string }

function MetricsGrid({ metrics = [] }: { metrics: MetricItem[] }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400',
    indigo: 'text-indigo-400', teal: 'text-teal-400', emerald: 'text-emerald-400',
    orange: 'text-orange-400', gray: 'text-gray-300',
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="bg-gray-800 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold mb-1 ${colorMap[m.color ?? 'gray'] ?? 'text-white'}`}>{m.value}</p>
          <p className="text-xs text-gray-400 mb-1">{m.label}</p>
          {m.delta && (
            <p className={`text-xs font-medium ${m.trend === 'up' ? 'text-green-400' : m.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {m.delta}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TractionSection({ content }: { content: Record<string, unknown> }) {
  const milestones = (content.milestones as { date: string; event: string }[]) ?? [];
  const logos = (content.logos as string[]) ?? [];
  return (
    <div className="space-y-6">
      {content.narrative && (
        <p className="text-gray-300 leading-relaxed">{content.narrative as string}</p>
      )}
      <div className="relative border-l border-gray-700 pl-6 space-y-5">
        {milestones.map((m, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-900" />
            <p className="text-xs text-blue-400 font-medium mb-0.5">{m.date}</p>
            <p className="text-sm text-gray-200">{m.event}</p>
          </div>
        ))}
      </div>
      {logos.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Notable Customers</p>
          <div className="flex flex-wrap gap-3">
            {logos.map((logo, i) => (
              <span key={i} className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-gray-700">
                {logo}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialsSection({ content }: { content: Record<string, unknown> }) {
  const cohorts = (content.cohort_retention as { cohort: string; m3?: number; m6?: number; m12?: number; m18?: number }[]) ?? [];
  const breakdown = (content.revenue_breakdown as { segment: string; pct: number }[]) ?? [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ACV', value: content.acv_label },
          { label: 'CAC', value: content.cac_label },
          { label: 'LTV', value: content.ltv_label },
          { label: 'LTV / CAC', value: content.ltv_cac_ratio },
        ].map((item, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-sm text-gray-200 font-medium leading-snug">{item.value as string}</p>
          </div>
        ))}
      </div>

      {cohorts.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Cohort Retention (%)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 pr-4">Cohort</th>
                  <th className="text-center px-3 py-2">M3</th>
                  <th className="text-center px-3 py-2">M6</th>
                  <th className="text-center px-3 py-2">M12</th>
                  <th className="text-center px-3 py-2">M18</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-2 pr-4 text-gray-400">{c.cohort}</td>
                    {[c.m3, c.m6, c.m12, c.m18].map((v, j) => (
                      <td key={j} className="text-center px-3 py-2">
                        {v != null ? (
                          <span className={`font-medium ${v >= 95 ? 'text-green-400' : v >= 90 ? 'text-blue-400' : 'text-gray-300'}`}>
                            {v}%
                          </span>
                        ) : <span className="text-gray-700">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {breakdown.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Revenue Mix</p>
          <div className="space-y-2">
            {breakdown.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{b.segment}</span><span>{b.pct}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TeamMember { name: string; title: string; bio: string; photo_initials: string }
interface Advisor { name: string; note: string }

function TeamSection({ content }: { content: Record<string, unknown> }) {
  const members = (content.members as TeamMember[]) ?? [];
  const advisors = (content.advisors as Advisor[]) ?? [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {members.map((m, i) => (
          <div key={i} className="flex gap-4 bg-gray-800 rounded-xl p-5">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {m.photo_initials}
            </div>
            <div>
              <p className="font-semibold text-white">{m.name}</p>
              <p className="text-xs text-blue-400 mb-2">{m.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{m.bio}</p>
            </div>
          </div>
        ))}
      </div>
      {advisors.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Advisors</p>
          <div className="flex flex-wrap gap-3">
            {advisors.map((a, i) => (
              <div key={i} className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                <p className="text-sm font-medium text-white">{a.name}</p>
                <p className="text-xs text-gray-400">{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Module { name: string; desc: string; status: string }

function ProductSection({ content }: { content: Record<string, unknown> }) {
  const modules = (content.modules as Module[]) ?? [];
  const statusColor: Record<string, string> = {
    GA: 'bg-green-900/50 text-green-400 border-green-800',
    BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  };
  return (
    <div className="space-y-5">
      {content.tagline && (
        <p className="text-gray-300 italic">{content.tagline as string}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.map((mod, i) => (
          <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-xl p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-white">{mod.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[mod.status] ?? 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                  {mod.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{mod.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {content.demo_link && (
        <a
          href={content.demo_link as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
        >
          {(content.demo_cta as string) ?? 'Try Live Demo'} →
        </a>
      )}
    </div>
  );
}

interface FaqItem { q: string; a: string }

function FaqSection({ content }: { content: Record<string, unknown> }) {
  const items = (content.items as FaqItem[]) ?? [];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
          >
            <span className="text-sm font-medium text-white">{item.q}</span>
            <span className="text-gray-500 text-lg shrink-0">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-300 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
