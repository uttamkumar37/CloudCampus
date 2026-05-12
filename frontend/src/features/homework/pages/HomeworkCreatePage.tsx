import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { listSubjects } from '@/features/school-admin/api/subjectApi';
import { createHomework } from '../api/homeworkApi';
import type { HomeworkCreateRequest } from '../types/homework';

interface FormState {
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  publishImmediately: boolean;
}

const EMPTY: FormState = {
  academicYearId: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
  publishImmediately: false,
};

// Returns tomorrow in YYYY-MM-DD (minimum valid due date)
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function HomeworkCreatePage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const navigate  = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState('');

  // ── Reference data ─────────────────────────────────────────────────────────
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', form.academicYearId],
    queryFn: () => listClasses(form.academicYearId),
    enabled: !!form.academicYearId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', form.classId],
    queryFn: () => listSections(form.classId),
    enabled: !!form.classId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => listSubjects(schoolId, true),
    enabled: !!schoolId,
  });

  // ── Mutation ───────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: HomeworkCreateRequest) => createHomework(schoolId, body),
    onSuccess: () => navigate('/school-admin/homework'),
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setError(err?.response?.data?.error?.message ?? 'Failed to create assignment');
    },
  });

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'academicYearId') { next.classId = ''; next.sectionId = ''; }
      if (key === 'classId') next.sectionId = '';
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.academicYearId || !form.classId || !form.subjectId || !form.title || !form.dueDate) {
      setError('Academic year, class, subject, title, and due date are required');
      return;
    }
    createMutation.mutate({
      academicYearId:     form.academicYearId,
      classId:            form.classId,
      sectionId:          form.sectionId || undefined,
      subjectId:          form.subjectId,
      title:              form.title,
      description:        form.description || undefined,
      dueDate:            form.dueDate,
      publishImmediately: form.publishImmediately,
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Homework Assignment</h1>
        <p className="mt-0.5 text-sm text-gray-500">Create and optionally publish immediately</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Academic Year */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year *</label>
          <select
            value={form.academicYearId}
            onChange={(e) => handleChange('academicYearId', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select academic year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>{ay.name}</option>
            ))}
          </select>
        </div>

        {/* Class + Section row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Class *</label>
            <select
              value={form.classId}
              onChange={(e) => handleChange('classId', e.target.value)}
              disabled={!form.academicYearId}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Section <span className="text-gray-400">(optional)</span></label>
            <select
              value={form.sectionId}
              onChange={(e) => handleChange('sectionId', e.target.value)}
              disabled={!form.classId}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            >
              <option value="">All sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
          <select
            value={form.subjectId}
            onChange={(e) => handleChange('subjectId', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={200}
            required
            placeholder="e.g. Chapter 5 — Practice Problems"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description / Instructions</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder="What should students do? Include page numbers, questions, or any special instructions."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            min={tomorrow()}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <input
            id="publish"
            type="checkbox"
            checked={form.publishImmediately}
            onChange={(e) => handleChange('publishImmediately', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="publish" className="text-sm text-gray-700">
            Publish immediately
            <span className="ml-1 text-xs text-gray-400">(unchecked = saved as draft)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Saving…' : form.publishImmediately ? 'Publish Assignment' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/homework')}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
