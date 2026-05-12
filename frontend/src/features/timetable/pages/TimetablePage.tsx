import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { listSubjects } from '@/features/school-admin/api/subjectApi';
import { listStaff } from '@/features/staff/api/staffApi';
import { listTimetableSlots, addTimetableSlot, deleteTimetableSlot } from '../api/timetableApi';
import { DAYS_OF_WEEK } from '../types/timetable';
import type { DayOfWeek, TimetableSlot, TimetableSlotCreateRequest } from '../types/timetable';

const MAX_PERIODS = 8;
const PERIODS = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1);

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

// ── Add Slot Form State ────────────────────────────────────────────────────────

interface SlotForm {
  dayOfWeek: DayOfWeek | '';
  periodNumber: string;
  subjectId: string;
  staffId: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: SlotForm = {
  dayOfWeek: '',
  periodNumber: '',
  subjectId: '',
  staffId: '',
  startTime: '',
  endTime: '',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();

  // Filter state
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  // Add slot form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', academicYearId],
    queryFn: () => listClasses(academicYearId),
    enabled: !!academicYearId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => listSections(classId),
    enabled: !!classId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => listSubjects(schoolId, true),
    enabled: !!schoolId,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', schoolId],
    queryFn: () => listStaff(schoolId, { status: 'ACTIVE' }),
    enabled: !!schoolId,
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['timetable', schoolId, academicYearId, classId, sectionId],
    queryFn: () => listTimetableSlots(schoolId, academicYearId, classId, sectionId),
    enabled: !!(schoolId && academicYearId && classId && sectionId),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: (body: TimetableSlotCreateRequest) => addTimetableSlot(schoolId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', schoolId] });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setFormError('');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setFormError(err?.response?.data?.error?.message ?? 'Failed to add slot');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => deleteTimetableSlot(schoolId, slotId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable', schoolId] }),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function slotAt(day: DayOfWeek, period: number): TimetableSlot | undefined {
    return slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
  }

  function subjectName(id: string) {
    return subjects.find((s) => s.id === id)?.name ?? id.slice(0, 8);
  }

  function staffName(id: string | null) {
    if (!id) return '';
    const s = staff.find((t) => t.id === id);
    return s ? `${s.firstName} ${s.lastName}` : '';
  }

  // ── Form handlers ──────────────────────────────────────────────────────────

  function handleFilterChange(key: 'academicYearId' | 'classId' | 'sectionId', value: string) {
    if (key === 'academicYearId') {
      setAcademicYearId(value);
      setClassId('');
      setSectionId('');
    } else if (key === 'classId') {
      setClassId(value);
      setSectionId('');
    } else {
      setSectionId(value);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.dayOfWeek || !form.periodNumber || !form.subjectId) {
      setFormError('Day, period, and subject are required');
      return;
    }
    addMutation.mutate({
      academicYearId,
      classId,
      sectionId,
      subjectId: form.subjectId,
      staffId: form.staffId || undefined,
      dayOfWeek: form.dayOfWeek as DayOfWeek,
      periodNumber: Number(form.periodNumber),
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
    });
  }

  const canShowGrid = !!(academicYearId && classId && sectionId);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Timetable</h1>
          <p className="mt-0.5 text-sm text-gray-500">Weekly class schedule</p>
        </div>
        {canShowGrid && (
          <button
            onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Slot'}
          </button>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={academicYearId}
          onChange={(e) => handleFilterChange('academicYearId', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">— Academic Year —</option>
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>{ay.name}</option>
          ))}
        </select>

        <select
          value={classId}
          onChange={(e) => handleFilterChange('classId', e.target.value)}
          disabled={!academicYearId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">— Class —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sectionId}
          onChange={(e) => handleFilterChange('sectionId', e.target.value)}
          disabled={!classId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">— Section —</option>
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>{sec.name}</option>
          ))}
        </select>
      </div>

      {/* ── Add Slot Form ───────────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4"
        >
          <h2 className="mb-3 text-sm font-semibold text-blue-800">Add Slot</h2>
          {formError && (
            <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Day *</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select</option>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>{DAY_LABELS[d]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Period *</label>
              <select
                value={form.periodNumber}
                onChange={(e) => setForm((f) => ({ ...f, periodNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select</option>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Subject *</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Teacher</label>
              <select
                value={form.staffId}
                onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">— None —</option>
                {staff.map((t) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Save Slot'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Grid / Empty state ──────────────────────────────────────────────── */}
      {!canShowGrid ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          Select academic year, class, and section to view the timetable.
        </div>
      ) : slotsLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading timetable…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Period
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400">P{period}</td>
                  {DAYS_OF_WEEK.map((day) => {
                    const slot = slotAt(day, period);
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        {slot ? (
                          <div className="relative inline-flex min-w-[80px] flex-col rounded-lg bg-blue-50 px-3 py-1.5 text-left">
                            <span className="text-xs font-semibold text-blue-800">
                              {subjectName(slot.subjectId)}
                            </span>
                            {slot.staffId && (
                              <span className="text-[10px] text-blue-500">
                                {staffName(slot.staffId)}
                              </span>
                            )}
                            {slot.startTime && (
                              <span className="text-[10px] text-gray-400">
                                {slot.startTime.slice(0, 5)}
                                {slot.endTime ? `–${slot.endTime.slice(0, 5)}` : ''}
                              </span>
                            )}
                            <button
                              onClick={() => deleteMutation.mutate(slot.id)}
                              disabled={deleteMutation.isPending}
                              className="absolute right-1 top-1 rounded p-0.5 text-blue-300 hover:bg-blue-100 hover:text-red-500"
                              title="Remove slot"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canShowGrid && slots.length === 0 && !slotsLoading && (
        <p className="mt-4 text-center text-sm text-gray-400">
          No slots yet — click <strong>+ Add Slot</strong> to build the timetable.
        </p>
      )}
    </div>
  );
}
