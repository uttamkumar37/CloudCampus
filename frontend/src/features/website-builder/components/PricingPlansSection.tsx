import { useState } from 'react'
import type { PlanTier } from '../types'

interface Plan {
  tier: PlanTier
  name: string
  tagline: string
  monthlyPrice: number
  annualPrice: number
  color: string
  gradient: string
  badge?: string
  features: { label: string; included: boolean; highlight?: boolean }[]
}

const PLANS: Plan[] = [
  {
    tier: 'FREE',
    name: 'Starter',
    tagline: 'Perfect to get started',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'slate',
    gradient: 'from-slate-500 to-slate-700',
    features: [
      { label: 'Public school website', included: true },
      { label: 'General info & branding', included: true },
      { label: '7 page sections', included: true },
      { label: 'Photo gallery (20 photos)', included: true },
      { label: 'Admission enquiry form', included: true },
      { label: 'Basic theme colors (10)', included: true },
      { label: 'Notice board', included: true },
      { label: 'Social media links', included: true },
      { label: 'Blog & News', included: false },
      { label: 'Events calendar', included: false },
      { label: 'SEO tools', included: false },
      { label: 'Analytics integration', included: false },
      { label: 'WhatsApp button', included: false },
      { label: 'Custom domain', included: false },
    ],
  },
  {
    tier: 'GROWTH',
    name: 'Growth',
    tagline: 'For schools growing fast',
    monthlyPrice: 2999,
    annualPrice: 1999,
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    features: [
      { label: 'Everything in Starter', included: true },
      { label: 'Blog & News (unlimited posts)', included: true, highlight: true },
      { label: 'Events calendar with RSVP', included: true, highlight: true },
      { label: 'Social proof & testimonials', included: true, highlight: true },
      { label: 'SEO meta editor', included: true, highlight: true },
      { label: 'Google Analytics 4', included: true, highlight: true },
      { label: 'Facebook Pixel', included: true },
      { label: 'Advanced design & fonts', included: true },
      { label: 'Unlimited gallery photos', included: true },
      { label: '15+ page sections', included: true },
      { label: 'Teacher directory', included: false },
      { label: 'Fee calculator', included: false },
      { label: 'Booking system', included: false },
      { label: 'WhatsApp chat button', included: false },
    ],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    tagline: 'The complete school website',
    monthlyPrice: 5999,
    annualPrice: 3999,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-700',
    badge: 'Most Popular',
    features: [
      { label: 'Everything in Growth', included: true },
      { label: 'Teacher directory & profiles', included: true, highlight: true },
      { label: 'Fee structure & calculator', included: true, highlight: true },
      { label: 'PTM & open day bookings', included: true, highlight: true },
      { label: 'Activity registration', included: true, highlight: true },
      { label: 'WhatsApp chat button', included: true, highlight: true },
      { label: 'Live chat integration', included: true, highlight: true },
      { label: 'Newsletter subscription', included: true },
      { label: 'Custom domain (.com)', included: true },
      { label: 'SSL certificate', included: true },
      { label: 'Course catalog', included: true },
      { label: 'FAQ section builder', included: true },
      { label: 'A/B testing', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    tier: 'ELITE',
    name: 'Elite',
    tagline: 'For premium institutions',
    monthlyPrice: 9999,
    annualPrice: 6999,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'A/B testing landing pages', included: true, highlight: true },
      { label: 'Video hero background', included: true, highlight: true },
      { label: 'School merchandise store', included: true, highlight: true },
      { label: 'Online book/uniform orders', included: true, highlight: true },
      { label: 'AI chatbot (school Q&A)', included: true, highlight: true },
      { label: 'Virtual 360° school tour', included: true, highlight: true },
      { label: 'Custom CSS editor', included: true },
      { label: 'Version history & restore', included: true },
      { label: 'Scheduled publishing', included: true },
      { label: 'White-label branding', included: true },
      { label: 'Priority 24/7 support', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Custom integrations', included: true, highlight: true },
    ],
  },
]

const FEATURE_COMPARISON = [
  { category: 'Website Core', items: [
    { label: 'Public school website', FREE: true, GROWTH: true, PRO: true, ELITE: true },
    { label: 'Page sections', FREE: '7', GROWTH: '15+', PRO: '20+', ELITE: 'Unlimited' },
    { label: 'Photo gallery', FREE: '20 photos', GROWTH: 'Unlimited', PRO: 'Unlimited', ELITE: 'Unlimited' },
    { label: 'Custom themes', FREE: '10 colors', GROWTH: '20+ themes', PRO: 'Advanced', ELITE: 'Full custom' },
    { label: 'Custom domain', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'SSL certificate', FREE: false, GROWTH: false, PRO: true, ELITE: true },
  ]},
  { category: 'Content', items: [
    { label: 'Blog & News posts', FREE: false, GROWTH: 'Unlimited', PRO: 'Unlimited', ELITE: 'Unlimited' },
    { label: 'Events calendar', FREE: false, GROWTH: true, PRO: true, ELITE: true },
    { label: 'Teacher directory', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'Course catalog', FREE: false, GROWTH: false, PRO: true, ELITE: true },
  ]},
  { category: 'Admissions', items: [
    { label: 'Admission enquiry form', FREE: true, GROWTH: true, PRO: true, ELITE: true },
    { label: 'CRM lead pipeline', FREE: 'Basic', GROWTH: 'Advanced', PRO: 'Full', ELITE: 'Full + API' },
    { label: 'Fee calculator', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'Online fee payment', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'Booking system', FREE: false, GROWTH: false, PRO: true, ELITE: true },
  ]},
  { category: 'Marketing & SEO', items: [
    { label: 'SEO meta editor', FREE: false, GROWTH: true, PRO: true, ELITE: true },
    { label: 'Google Analytics 4', FREE: false, GROWTH: true, PRO: true, ELITE: true },
    { label: 'Facebook Pixel', FREE: false, GROWTH: true, PRO: true, ELITE: true },
    { label: 'WhatsApp chat button', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'Newsletter subscription', FREE: false, GROWTH: false, PRO: true, ELITE: true },
    { label: 'A/B testing', FREE: false, GROWTH: false, PRO: false, ELITE: true },
  ]},
]

const COLOR_MAP: Record<string, { card: string; btn: string; badge: string; check: string; ring: string }> = {
  slate: { card: 'border-slate-200', btn: 'bg-slate-800 hover:bg-slate-900 text-white', badge: 'bg-slate-100 text-slate-700', check: 'text-slate-500', ring: 'ring-slate-200' },
  sky: { card: 'border-sky-200', btn: 'bg-sky-600 hover:bg-sky-700 text-white', badge: 'bg-sky-100 text-sky-700', check: 'text-sky-500', ring: 'ring-sky-200' },
  violet: { card: 'border-violet-300 ring-2 ring-violet-200', btn: 'bg-violet-600 hover:bg-violet-700 text-white', badge: 'bg-violet-100 text-violet-700', check: 'text-violet-500', ring: 'ring-violet-200' },
  amber: { card: 'border-amber-200', btn: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white', badge: 'bg-amber-100 text-amber-700', check: 'text-amber-500', ring: 'ring-amber-200' },
}

function formatINR(n: number) {
  if (n === 0) return 'Free'
  return `₹${n.toLocaleString('en-IN')}`
}

interface Props {
  currentPlan: PlanTier
  onPlanChange: () => void
}

export function PricingPlansSection({ currentPlan, onPlanChange }: Props) {
  const [annual, setAnnual] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [activating, setActivating] = useState<PlanTier | null>(null)

  function activatePlan(tier: PlanTier) {
    setActivating(tier)
    setTimeout(() => {
      localStorage.setItem('wb_current_plan', tier)
      setActivating(null)
      onPlanChange()
    }, 1200)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          CloudCampus Website Builder Plans
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Choose your plan</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          From a simple school website to a full-featured digital campus. Upgrade anytime and unlock powerful tools that help you attract more admissions.
        </p>

        {/* Annual/Monthly toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Annual
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Save 33%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan) => {
          const c = COLOR_MAP[plan.color]
          const price = annual ? plan.annualPrice : plan.monthlyPrice
          const isCurrent = currentPlan === plan.tier
          const isActivating = activating === plan.tier

          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${c.card}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-6 space-y-4 flex-1">
                {/* Plan header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{plan.tier}</span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Current</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-slate-800">{formatINR(price)}</span>
                  {price > 0 && (
                    <span className="text-sm text-slate-400 mb-1">/{annual ? 'mo (billed annually)' : 'month'}</span>
                  )}
                </div>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString('en-IN')}/year
                  </p>
                )}

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.label} className={`flex items-start gap-2 text-sm ${!f.included ? 'opacity-40' : ''}`}>
                      {f.included ? (
                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${f.highlight ? c.check : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={f.highlight ? 'font-medium text-slate-700' : 'text-slate-600'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => !isCurrent && activatePlan(plan.tier)}
                  disabled={isCurrent || isActivating}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : `${c.btn} shadow-sm`
                  }`}
                >
                  {isActivating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Activating…
                    </span>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : plan.tier === 'FREE' ? (
                    'Downgrade to Free'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 py-4">
        {[
          { icon: '🔒', text: 'Secure payment' },
          { icon: '↩️', text: '30-day money back' },
          { icon: '⚡', text: 'Instant activation' },
          { icon: '📞', text: 'Dedicated support' },
          { icon: '🔄', text: 'Cancel anytime' },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2 text-sm text-slate-500">
            <span>{b.icon}</span>
            <span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Feature comparison toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          {showComparison ? 'Hide' : 'Show'} full feature comparison
          <svg className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Full comparison table */}
      {showComparison && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-4 text-slate-600 font-semibold w-1/3">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.tier} className={`px-4 py-4 text-center font-bold ${currentPlan === p.tier ? 'text-violet-600' : 'text-slate-700'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span>{p.name}</span>
                      {currentPlan === p.tier && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Current</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_COMPARISON.map((cat) => (
                <>
                  <tr key={cat.category} className="bg-slate-50">
                    <td colSpan={5} className="px-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{cat.category}</td>
                  </tr>
                  {cat.items.map((item, idx) => (
                    <tr key={item.label} className={`border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-5 py-3 text-slate-700">{item.label}</td>
                      {(['FREE', 'GROWTH', 'PRO', 'ELITE'] as PlanTier[]).map((tier) => {
                        const val = (item as Record<string, unknown>)[tier]
                        return (
                          <td key={tier} className="px-4 py-3 text-center">
                            {val === true ? (
                              <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : val === false ? (
                              <svg className="w-4 h-4 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <span className="text-xs font-medium text-slate-600">{String(val)}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Frequently asked questions</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { q: 'Can I upgrade or downgrade anytime?', a: 'Yes, you can change your plan at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
            { q: 'Is there a free trial for paid plans?', a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and Razorpay.' },
            { q: 'Can I use my own domain name?', a: 'Custom domains (.com, .in, .org) are available on Pro and Elite plans with free SSL included.' },
          ].map((faq) => (
            <div key={faq.q} className="space-y-1">
              <p className="font-semibold text-slate-700 text-sm">{faq.q}</p>
              <p className="text-sm text-slate-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
