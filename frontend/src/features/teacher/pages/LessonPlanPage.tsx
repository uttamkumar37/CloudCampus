import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMyPlansApi, createPlanApi, deletePlanApi, publishPlanApi,
  type LessonPlanResponse, type LessonPlanRequest,
} from '../../school-admin/api/lessonPlanApi';

function todayStr() { return new Date().toISOString().slice(0, 10); }
function plusDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100  text-green-800',
};

const TEXT_FIELDS: Array<{
  label: string;
  key: keyof Pick<LessonPlanRequest, 'topic' | 'objectives' | 'activities' | 'materials' | 'homeworkNote'>;
  required?: boolean;
}> = [
  { label: 'Topic *', key: 'topic', required: true },
  { label: 'Learning Objectives', key: 'objectives' },
  { label: 'Activities', key: 'activities' },
  { label: 'Materials / Resources', key: 'materials' },
  { label: 'Homework Note', key: 'homeworkNote' },
];

export function LessonPlanPage() {
  const qc = useQueryClient();
  const [from, setFrom] = useState(todayStr());
  const [to, setTo]     = useState(plusDays(14));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LessonPlanRequest>({
    planDate: todayStr(), topic: '', objectives: '', activities: '',
    materials: '', homeworkNote: '', publish: false,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['lesson-plans', from, to],
    queryFn:  () => listMyPlansApi(from, to),
  });

  const create = useMutation({
    mutationFn: () => createPlanApi(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-plans'] });
      setShowForm(false);
      setForm({ planDate: todayStr(), topic: '', objectives: '', activities: '',
                materials: '', homeworkNote: '', publish: false });
    },
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishPlanApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-plans'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePlanApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-plans'] }),
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Lesson Plans</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {/* Date range filter */}
      <div className="flex gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm" />
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-sm font-semibold text-blue-800 mb-3">New Lesson Plan</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date *</label>
              <input type="date" value={form.planDate}
                onChange={(e) => setForm({ ...form, planDate: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Period #</label>
              <input type="number" min={1} max={10} value={form.periodNumber ?? ''}
                onChange={(e) => setForm({ ...form, periodNumber: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
          </div>
          {TEXT_FIELDS.map(({ label, key, required }) => (
            <div key={key} className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">{label}</label>
              <textarea rows={2} value={form[key] ?? ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm resize-y"
                required={required} />
            </div>
          ))}
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.publish ?? false}
                onChange={(e) => setForm({ ...form, publish: e.target.checked })} />
              Publish immediately
            </label>
            <button
              onClick={() => create.mutate()}
              disabled={!form.topic.trim() || !form.planDate || create.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {create.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Plan list */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-gray-500">No lesson plans in this date range.</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan: LessonPlanResponse) => (
            <div key={plan.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-medium text-gray-900">{plan.topic}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {plan.planDate}{plan.periodNumber ? ` · Period ${plan.periodNumber}` : ''}
                  </span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[plan.status]}`}>
                  {plan.status}
                </span>
              </div>
              {plan.objectives && <p className="text-xs text-gray-600 mt-1"><strong>Objectives:</strong> {plan.objectives}</p>}
              {plan.activities && <p className="text-xs text-gray-600 mt-1"><strong>Activities:</strong> {plan.activities}</p>}
              {plan.homeworkNote && <p className="text-xs text-gray-600 mt-1"><strong>Homework:</strong> {plan.homeworkNote}</p>}
              <div className="flex gap-2 mt-3">
                {plan.status === 'DRAFT' && (
                  <button onClick={() => publish.mutate(plan.id)}
                    disabled={publish.isPending}
                    className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50">
                    Publish
                  </button>
                )}
                <button onClick={() => { if (confirm('Delete this plan?')) remove.mutate(plan.id); }}
                  disabled={remove.isPending}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
