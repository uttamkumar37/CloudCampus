import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { createExam } from '../api/examApi';
import type { ExamType } from '../types/exam';

// ── Schema ────────────────────────────────────────────────────────────────────

const subjectSchema = z.object({
  subjectId: z.string().uuid({ message: 'Valid subject UUID required' }),
  classId: z.string().uuid({ message: 'Valid class UUID required' }),
  sectionId: z.string().optional(),
  examDate: z.string().min(1, 'Exam date required'),
  startTime: z.string().optional(),
  durationMinutes: z.string().optional(),
  totalMarks: z.string().min(1, 'Total marks required'),
  passingMarks: z.string().min(1, 'Passing marks required'),
  roomNumber: z.string().optional(),
});

const schema = z.object({
  academicYearId: z.string().uuid({ message: 'Valid academic year UUID required' }),
  name: z.string().min(1, 'Exam name is required').max(200),
  examType: z.enum(
    ['UNIT_TEST', 'TERM', 'HALF_YEARLY', 'ANNUAL', 'MOCK', 'PRACTICAL'],
    { message: 'Select exam type' },
  ),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  totalMarks: z.string().min(1, 'Total marks required'),
  passingMarks: z.string().min(1, 'Passing marks required'),
  instructions: z.string().optional(),
  subjects: z.array(subjectSchema).optional(),
});

type FormValues = z.infer<typeof schema>;

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: 'UNIT_TEST', label: 'Unit Test' },
  { value: 'TERM', label: 'Term' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'MOCK', label: 'Mock' },
  { value: 'PRACTICAL', label: 'Practical' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExamCreatePage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subjects: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return createExam(schoolId, {
        academicYearId: values.academicYearId,
        name: values.name,
        examType: values.examType,
        startDate: values.startDate,
        endDate: values.endDate,
        totalMarks: parseFloat(values.totalMarks),
        passingMarks: parseFloat(values.passingMarks),
        instructions: values.instructions || undefined,
        subjects: values.subjects?.map((s) => ({
          subjectId: s.subjectId,
          classId: s.classId,
          sectionId: s.sectionId || undefined,
          examDate: s.examDate,
          startTime: s.startTime || undefined,
          durationMinutes: s.durationMinutes ? parseInt(s.durationMinutes) : undefined,
          totalMarks: parseFloat(s.totalMarks),
          passingMarks: parseFloat(s.passingMarks),
          roomNumber: s.roomNumber || undefined,
        })),
      });
    },
    onSuccess: (exam) => {
      navigate(`/school-admin/exams/${exam.id}`);
    },
    onError: (err: Error) => {
      setApiError(err.message || 'Failed to create exam');
    },
  });

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  const labelCls = 'mb-1 block text-sm font-medium text-gray-700';
  const errCls = 'mt-1 text-xs text-red-600';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create Exam</h2>
        <p className="mt-0.5 text-sm text-gray-500">Fill in exam details and optionally schedule subject papers inline.</p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{apiError}</div>
      )}

      <form
        onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
        className="space-y-6"
      >
        {/* Core fields */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Exam Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Exam Name</label>
              <input {...form.register('name')} placeholder="Annual Examination 2025-26" className={inputCls} />
              {form.formState.errors.name && (
                <p className={errCls}>{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Academic Year ID</label>
              <input {...form.register('academicYearId')} placeholder="UUID of academic year" className={inputCls} />
              {form.formState.errors.academicYearId && (
                <p className={errCls}>{form.formState.errors.academicYearId.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Exam Type</label>
              <select {...form.register('examType')} className={inputCls}>
                <option value="">Select type…</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.examType && (
                <p className={errCls}>{form.formState.errors.examType.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" {...form.register('startDate')} className={inputCls} />
              {form.formState.errors.startDate && (
                <p className={errCls}>{form.formState.errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" {...form.register('endDate')} className={inputCls} />
              {form.formState.errors.endDate && (
                <p className={errCls}>{form.formState.errors.endDate.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Total Marks</label>
              <input type="number" step="0.5" {...form.register('totalMarks')} placeholder="100" className={inputCls} />
              {form.formState.errors.totalMarks && (
                <p className={errCls}>{form.formState.errors.totalMarks.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Passing Marks</label>
              <input type="number" step="0.5" {...form.register('passingMarks')} placeholder="35" className={inputCls} />
              {form.formState.errors.passingMarks && (
                <p className={errCls}>{form.formState.errors.passingMarks.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>
                Instructions <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                {...form.register('instructions')}
                rows={3}
                placeholder="Any special instructions for invigilators or students…"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Subject papers */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Subject Papers <span className="font-normal normal-case text-gray-400">(optional — can add later)</span>
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  subjectId: '',
                  classId: '',
                  sectionId: '',
                  examDate: '',
                  startTime: '',
                  durationMinutes: '',
                  totalMarks: '',
                  passingMarks: '',
                  roomNumber: '',
                })
              }
              className="rounded-lg border border-indigo-300 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
            >
              + Add Subject
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-gray-400">No subject papers added yet.</p>
          )}

          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="absolute right-3 top-3 text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
                <p className="mb-3 text-xs font-semibold uppercase text-gray-400">
                  Paper {idx + 1}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Subject ID</label>
                    <input
                      {...form.register(`subjects.${idx}.subjectId`)}
                      placeholder="UUID"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Class ID</label>
                    <input
                      {...form.register(`subjects.${idx}.classId`)}
                      placeholder="UUID"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Exam Date</label>
                    <input
                      type="date"
                      {...form.register(`subjects.${idx}.examDate`)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <input
                      type="time"
                      {...form.register(`subjects.${idx}.startTime`)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Duration (min)</label>
                    <input
                      type="number"
                      {...form.register(`subjects.${idx}.durationMinutes`)}
                      placeholder="180"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Room No.</label>
                    <input
                      {...form.register(`subjects.${idx}.roomNumber`)}
                      placeholder="A-101"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Total Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      {...form.register(`subjects.${idx}.totalMarks`)}
                      placeholder="100"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Passing Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      {...form.register(`subjects.${idx}.passingMarks`)}
                      placeholder="35"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create Exam'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/exams')}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
