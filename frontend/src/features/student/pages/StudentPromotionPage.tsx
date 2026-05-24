import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { listStudentsByClass, listStudentsBySection, promoteStudents } from '../api/studentApi';
import type { PromotionResult } from '../api/studentApi';
import { useToast, PageHeader, ConfirmDialog } from '@/shared/ui';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentPromotionPage() {
  const { success, error: toastError } = useToast();
  const schoolId = useAuthStore((s) => s.user?.schoolId ?? '');
  const navigate  = useNavigate();

  // Source selectors
  const [srcYearId,    setSrcYearId]    = useState('');
  const [srcClassId,   setSrcClassId]   = useState('');
  const [srcSectionId, setSrcSectionId] = useState('');

  // Target selectors
  const [tgtYearId,    setTgtYearId]    = useState('');
  const [tgtClassId,   setTgtClassId]   = useState('');
  const [tgtSectionId, setTgtSectionId] = useState('');

  const [result, setResult] = useState<PromotionResult | null>(null);
  const [confirmPromote, setConfirmPromote] = useState(false);

  // ── Shared academic years ──────────────────────────────────────────────────
  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn:  () => listAcademicYears(schoolId),
    enabled:  !!schoolId,
  });

  const effectiveSrcYearId = srcYearId || years.find((y) => y.isCurrent)?.id || years[0]?.id || '';
  const effectiveTgtYearId = tgtYearId || years.find((y) => y.isCurrent)?.id || years[0]?.id || '';

  // ── Source cascading ───────────────────────────────────────────────────────
  const { data: srcClasses = [] } = useQuery({
    queryKey: ['classes', effectiveSrcYearId],
    queryFn:  () => listClasses(effectiveSrcYearId),
    enabled:  !!effectiveSrcYearId,
  });
  const { data: srcSections = [] } = useQuery({
    queryKey: ['sections', srcClassId],
    queryFn:  () => listSections(srcClassId),
    enabled:  !!srcClassId,
  });

  // ── Target cascading ───────────────────────────────────────────────────────
  const { data: tgtClasses = [] } = useQuery({
    queryKey: ['classes', effectiveTgtYearId],
    queryFn:  () => listClasses(effectiveTgtYearId),
    enabled:  !!effectiveTgtYearId,
  });
  const { data: tgtSections = [] } = useQuery({
    queryKey: ['sections', tgtClassId],
    queryFn:  () => listSections(tgtClassId),
    enabled:  !!tgtClassId,
  });

  // ── Preview count ──────────────────────────────────────────────────────────
  const { data: previewStudents = [] } = useQuery({
    queryKey: ['promote-preview', srcSectionId, srcClassId],
    queryFn:  () =>
      srcSectionId
        ? listStudentsBySection(srcSectionId)
        : listStudentsByClass(srcClassId),
    enabled: !!srcClassId,
  });

  const activePreview = previewStudents.filter((s) => s.status === 'ACTIVE');

  const canDryRun = !!schoolId && !!srcClassId && !!tgtClassId;
  const { data: dryRunPreview, isFetching: isDryRunFetching } = useQuery({
    queryKey: ['promote-dry-run', schoolId, srcClassId, srcSectionId, tgtClassId, tgtSectionId],
    queryFn: () =>
      promoteStudents(
        schoolId,
        {
          sourceClassId:   srcClassId,
          sourceSectionId: srcSectionId || null,
          targetClassId:   tgtClassId,
          targetSectionId: tgtSectionId || null,
        },
        { dryRun: true },
      ),
    enabled: canDryRun,
  });

  const previewCount = dryRunPreview?.studentsFound ?? activePreview.length;

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate, isPending, isError } = useMutation({
    mutationFn: () =>
      promoteStudents(schoolId, {
        sourceClassId:   srcClassId,
        sourceSectionId: srcSectionId || null,
        targetClassId:   tgtClassId,
        targetSectionId: tgtSectionId || null,
      }),
    onSuccess: (data) => {
      success(`${data.studentsPromoted} student${data.studentsPromoted !== 1 ? 's' : ''} promoted successfully`);
      setResult(data);
    },
    onError: () => { toastError('Promotion failed. Please check your selection and try again.'); },
  });

  const canPromote =
    !!srcClassId &&
    !!tgtClassId &&
    previewCount > 0 &&
    !!dryRunPreview &&
    !result;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mb-3 text-4xl font-bold text-green-700">{result.studentsPromoted}</div>
          <p className="text-base font-semibold text-green-800">
            student{result.studentsPromoted !== 1 ? 's' : ''} promoted successfully
          </p>
          <p className="mt-1 text-sm text-green-600">
            Their class and section have been updated in the system.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/school-admin/students')}
              className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              View Students
            </button>
            <button
              onClick={() => {
                setResult(null);
                setSrcClassId(''); setSrcSectionId('');
                setTgtClassId(''); setTgtSectionId('');
              }}
              className="rounded-lg border border-green-300 px-5 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Promote Another Class
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/school-admin/students')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
        <div>
          <PageHeader title="Promote Students" />
          <p className="mt-0.5 text-sm text-gray-500">
            Bulk-move ACTIVE students from one class to the next at year-end
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            From (Source)
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
            <select
              value={srcYearId || effectiveSrcYearId}
              onChange={(e) => { setSrcYearId(e.target.value); setSrcClassId(''); setSrcSectionId(''); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' ★' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
            <select
              value={srcClassId}
              onChange={(e) => { setSrcClassId(e.target.value); setSrcSectionId(''); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!effectiveSrcYearId}
            >
              <option value="">Select class…</option>
              {srcClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Section <span className="text-gray-400">(optional — leave blank to promote all sections)</span>
            </label>
            <select
              value={srcSectionId}
              onChange={(e) => setSrcSectionId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!srcClassId}
            >
              <option value="">All sections</option>
              {srcSections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {srcClassId && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              activePreview.length > 0
                ? 'bg-blue-50 text-blue-800'
                : 'bg-gray-50 text-gray-500'
            }`}>
              {previewCount > 0
                ? <><span className="font-bold">{previewCount}</span> ACTIVE student{previewCount !== 1 ? 's' : ''} will be promoted</>
                : 'No ACTIVE students found in this selection.'}
            </div>
          )}
        </div>

        {/* Target panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            To (Target)
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
            <select
              value={tgtYearId || effectiveTgtYearId}
              onChange={(e) => { setTgtYearId(e.target.value); setTgtClassId(''); setTgtSectionId(''); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' ★' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
            <select
              value={tgtClassId}
              onChange={(e) => { setTgtClassId(e.target.value); setTgtSectionId(''); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!effectiveTgtYearId}
            >
              <option value="">Select class…</option>
              {tgtClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Section <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={tgtSectionId}
              onChange={(e) => setTgtSectionId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!tgtClassId}
            >
              <option value="">Unassigned</option>
              {tgtSections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Spacer so button aligns at bottom */}
          <div className="flex-1" />
        </div>
      </div>

      {/* Action */}
      <div className="mt-6">
        {isError && (
          <p className="mb-3 text-sm text-red-600">Promotion failed. Please check your selection and try again.</p>
        )}

        <button
          onClick={() => setConfirmPromote(true)}
          disabled={!canPromote || isPending}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending
            ? 'Promoting…'
            : canPromote
              ? `Promote ${previewCount} Student${previewCount !== 1 ? 's' : ''}`
              : isDryRunFetching
                ? 'Checking Preview…'
              : 'Promote Students'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmPromote}
        onClose={() => setConfirmPromote(false)}
        onConfirm={() => { mutate(); setConfirmPromote(false); }}
        title="Promote students"
        description={`Promote ${previewCount} ACTIVE student${previewCount !== 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Promote"
        loading={isPending}
      />
    </div>
  );
}
