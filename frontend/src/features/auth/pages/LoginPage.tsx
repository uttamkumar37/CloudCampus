import { useDeferredValue, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useLogin } from '../hooks/useLogin'
import { getSchoolBySlug, searchSchools } from '../api/authApi'
import type { SchoolSearchResult, UserRole } from '../types'

function schoolInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function getSchoolSlugFromHostname(hostname: string) {
  const h = hostname.trim().toLowerCase()
  if (!h || h === 'localhost' || h === '127.0.0.1') return null
  if (h.endsWith('.localhost')) {
    const c = h.slice(0, -'.localhost'.length)
    return c && !c.includes('.') ? c : null
  }
  const segs = h.split('.')
  if (segs.length >= 3) {
    const c = segs[0]
    return ['www', 'app', 'api', 'admin', 'super-admin'].includes(c) ? null : c
  }
  return null
}

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Academic Management',
    desc: 'Classes, timetable, homework & marks in one place',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Complete Directory',
    desc: 'Students, teachers and parent connections',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Real-time Insights',
    desc: 'Live attendance tracking and fee management',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuthSession } = useAuth()
  const loginMutation = useLogin()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [schoolQuery, setSchoolQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [lockedSchoolSlug, setLockedSchoolSlug] = useState<string | null>(null)

  const paramRole = searchParams.get('role') as Exclude<UserRole, 'SUPER_ADMIN'> | null
  const validRoles: Exclude<UserRole, 'SUPER_ADMIN'>[] = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'SUPER_ADMIN'> | ''>(
    paramRole && validRoles.includes(paramRole) ? paramRole : ''
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const deferredQuery = useDeferredValue(schoolQuery.trim())
  const schoolsQuery = useQuery({
    queryKey: ['auth', 'schools', deferredQuery],
    queryFn: () => searchSchools(deferredQuery),
    enabled: !selectedSchool && deferredQuery.length >= 2,
    staleTime: 60_000,
  })

  useEffect(() => {
    // Priority 1: ?school= query param (from public website login links)
    const paramSlug = searchParams.get('school')
    // Priority 2: subdomain-based auto-detect
    const hostSlug = getSchoolSlugFromHostname(window.location.hostname)
    const slug = paramSlug || hostSlug
    if (!slug) return
    let cancelled = false
    getSchoolBySlug(slug)
      .then((res) => {
        if (!cancelled && res.success) {
          setSelectedSchool(res.data)
          setLockedSchoolSlug(slug)
          setSchoolQuery(res.data.schoolName)
        }
      })
      .catch(() => {
        if (!cancelled) setLockedSchoolSlug(null)
      })
    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const schoolResults = schoolsQuery.data?.data ?? []

  const handleSelectSchool = (school: SchoolSearchResult) => {
    setSelectedSchool(school)
    setSchoolQuery(school.schoolName)
    setShowDropdown(false)
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!selectedSchool) {
      setFormError('Search and select your school first.')
      return
    }
    if (!selectedRole) {
      setFormError('Please select your role.')
      return
    }

    try {
      const res = await loginMutation.mutateAsync({
        username,
        password,
        tenantSlug: selectedSchool.slug,
        role: selectedRole,
      })

      if (!res.success) {
        setFormError(res.message || 'Invalid credentials.')
        return
      }

      setAuthSession(res.data)
      const role = res.data.role
      let path = '/dashboard'
      if (role === 'TEACHER') path = '/teacher/dashboard'
      else if (role === 'STUDENT') path = '/student/dashboard'
      else if (role === 'PARENT') path = '/parent/dashboard'
      navigate(path, { replace: true })
    } catch {
      setFormError('Unable to sign in. Check your credentials and try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4">
      <div className="w-full max-w-5xl">
        {/* Main card */}
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] rounded-3xl overflow-hidden shadow-[0_32px_80px_-24px_rgba(15,23,42,0.28)] border border-slate-200/70 bg-white">

          {/* ── Left hero panel ── */}
          <div className="relative bg-gradient-to-br from-emerald-900 via-[#0c4a36] to-teal-950 p-10 xl:p-14 text-white overflow-hidden flex flex-col">
            {/* Animated orbs */}
            <div className="cc-orb absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="cc-orb-slow absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="cc-orb absolute top-1/2 right-4 w-48 h-48 rounded-full bg-emerald-600/10 blur-2xl" />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* Logo */}
              <div className="cc-fade-in flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-emerald-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <span className="text-base font-bold tracking-tight">CloudCampus</span>
              </div>

              {/* Headline */}
              <div className="mt-12 flex-1">
                <p className="cc-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">School ERP Platform</p>
                <h1 className="cc-fade-up cc-delay-1 mt-4 text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
                  The smarter way<br />to run your school
                </h1>
                <p className="cc-fade-up cc-delay-2 mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
                  Manage students, staff, fees, attendance and academics from one beautifully designed platform.
                </p>

                {/* Feature list */}
                <div className="mt-10 space-y-5">
                  {FEATURES.map((f, i) => (
                    <div key={f.title} className={`cc-fade-up cc-delay-${i + 2} flex items-start gap-4`}>
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-emerald-300">
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/95">{f.title}</p>
                        <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="cc-fade-up cc-delay-5 mt-12 grid grid-cols-3 gap-4">
                  {[['50+', 'Schools'], ['10k+', 'Students'], ['99%', 'Uptime']].map(([n, l]) => (
                    <div key={l} className="rounded-2xl bg-white/6 border border-white/10 p-3 text-center">
                      <p className="text-lg font-bold text-white">{n}</p>
                      <p className="text-xs text-white/50 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-white/10">
                <p className="text-xs text-white/30">© 2025 CloudCampus · Secure multi-tenant school management</p>
              </div>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="bg-white p-8 xl:p-12 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              <div className="cc-fade-up">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="mt-1.5 text-sm text-slate-500">Sign in to your school workspace.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5 cc-fade-up cc-delay-1">

                {/* ── School search ── */}
                <div className="space-y-1.5" ref={dropdownRef}>
                  <label className="block text-sm font-semibold text-slate-700">School</label>
                  <div className="relative">
                    {selectedSchool ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 transition">
                        {selectedSchool.logoUrl ? (
                          <img
                            src={selectedSchool.logoUrl}
                            alt={selectedSchool.schoolName}
                            className="w-8 h-8 rounded-lg object-cover border border-emerald-100 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: selectedSchool.primaryColor || '#059669' }}
                          >
                            {schoolInitials(selectedSchool.schoolName)}
                          </div>
                        )}
                        <span className="flex-1 text-sm font-semibold text-slate-800 truncate">
                          {selectedSchool.schoolName}
                        </span>
                        {!lockedSchoolSlug && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchool(null)
                              setSchoolQuery('')
                              setFormError(null)
                            }}
                            className="p-0.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                            aria-label="Clear school"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={schoolQuery}
                            onChange={(e) => {
                              setSchoolQuery(e.target.value)
                              setShowDropdown(true)
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="cc-input pl-9"
                            placeholder="Search by school name..."
                            autoFocus
                          />
                          {schoolsQuery.isLoading && (
                            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                        </div>

                        {showDropdown && deferredQuery.length >= 2 && (
                          <div className="cc-dropdown">
                            {schoolsQuery.isLoading ? (
                              <div className="px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
                                <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Searching schools...
                              </div>
                            ) : schoolResults.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-slate-500">
                                No schools found for "{deferredQuery}"
                              </div>
                            ) : (
                              <div className="max-h-52 overflow-y-auto">
                                {schoolResults.map((school) => (
                                  <button
                                    key={school.slug}
                                    type="button"
                                    onClick={() => handleSelectSchool(school)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition border-b border-slate-100 last:border-0"
                                  >
                                    {school.logoUrl ? (
                                      <img src={school.logoUrl} alt={school.schoolName} className="w-9 h-9 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                                    ) : (
                                      <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                        style={{ backgroundColor: school.primaryColor || '#059669' }}
                                      >
                                        {schoolInitials(school.schoolName)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">{school.schoolName}</p>
                                      <p className="text-xs text-slate-400">/{school.slug}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {showDropdown && deferredQuery.length < 2 && deferredQuery.length > 0 && (
                          <div className="cc-dropdown px-4 py-3 text-xs text-slate-400">
                            Type at least 2 characters to search...
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ── Role dropdown ── */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Sign in as</label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                      className="cc-input appearance-none pr-10 cursor-pointer"
                      required
                    >
                      <option value="">Select your role...</option>
                      <option value="SCHOOL_ADMIN">School Admin — Manage school operations</option>
                      <option value="TEACHER">Teacher — Classes, grades & homework</option>
                      <option value="STUDENT">Student — Dashboard, schedule & fees</option>
                      <option value="PARENT">Parent — Track my children's progress</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* ── Separator ── */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-400 font-medium">Credentials</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* ── Username ── */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Username</label>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="cc-input pl-9"
                      placeholder="Enter your username"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* ── Password ── */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cc-input pl-9 pr-11"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Error ── */}
                {formError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                {/* ── Submit ── */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
                >
                  {loginMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <a
                  href="/super-admin/login"
                  className="text-xs text-slate-400 hover:text-emerald-700 transition font-medium"
                >
                  Platform administrator access →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
