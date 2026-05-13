import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { bulkImportStudents } from '../api/studentApi';
import type { BulkStudentRow, BulkImportResult } from '../api/studentApi';

// ── CSV helpers ───────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'firstName', 'lastName', 'admissionDate', 'dateOfBirth',
  'gender', 'studentNumber', 'classId', 'sectionId', 'phone',
];

const TEMPLATE_CSV = [
  CSV_HEADERS.join(','),
  'John,Doe,2025-06-01,2010-05-15,MALE,,,, 9876543210',
  'Jane,Smith,,2011-03-22,FEMALE,,,,',
].join('\n');

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'student_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): BulkStudentRow[] {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => { raw[h] = values[i] ?? ''; });

    return {
      firstName:     raw.firstName     || '',
      lastName:      raw.lastName      || '',
      admissionDate: raw.admissionDate || null,
      dateOfBirth:   raw.dateOfBirth   || null,
      gender:        (['MALE', 'FEMALE', 'OTHER'].includes(raw.gender?.toUpperCase())
                       ? raw.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER'
                       : null),
      studentNumber: raw.studentNumber || null,
      classId:       raw.classId       || null,
      sectionId:     raw.sectionId     || null,
      phone:         raw.phone         || null,
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentBulkImportPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);

  const [rows, setRows]       = useState<BulkStudentRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [result, setResult]   = useState<BulkImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: () => bulkImportStudents(schoolId, rows),
    onSuccess: (data) => setResult(data),
  });

  function handleFile(file: File) {
    setParseError('');
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text    = e.target?.result as string;
        const parsed  = parseCSV(text);
        if (parsed.length === 0) {
          setParseError('No data rows found. Make sure the file has a header row and at least one data row.');
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError('Failed to parse the CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
    else setParseError('Please drop a .csv file.');
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/school-admin/students')}
          className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bulk Import Students</h1>
          <p className="mt-0.5 text-sm text-gray-500">Upload a CSV file to admit multiple students at once</p>
        </div>
      </div>

      {/* Step 1 — Download template */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-semibold text-gray-700">Step 1 — Download the template</h2>
        <p className="mb-3 text-xs text-gray-500">
          Fill in the CSV template. Only <code className="rounded bg-gray-100 px-1">firstName</code> and{' '}
          <code className="rounded bg-gray-100 px-1">lastName</code> are required per row.
          Leave <code className="rounded bg-gray-100 px-1">studentNumber</code> blank to auto-generate.
        </p>
        <button onClick={downloadTemplate}
          className="rounded-lg border border-blue-200 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
          ⬇ Download template.csv
        </button>
      </div>

      {/* Step 2 — Upload */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Step 2 — Upload filled CSV</h2>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          <p className="text-sm text-gray-500">
            {fileName
              ? <span className="font-medium text-gray-800">{fileName}</span>
              : 'Drag & drop a CSV file here, or click to browse'}
          </p>
          {rows.length > 0 && (
            <p className="mt-1 text-xs text-green-600">{rows.length} row{rows.length !== 1 ? 's' : ''} parsed</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {parseError && (
          <p className="mt-2 text-sm text-red-600">{parseError}</p>
        )}
      </div>

      {/* Preview table */}
      {rows.length > 0 && !result && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Preview ({rows.length} rows)</h2>
            <button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {importMutation.isPending ? 'Importing…' : `Import ${rows.length} Student${rows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'First Name', 'Last Name', 'DOB', 'Gender', 'Phone', 'Student No.'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${!r.firstName || !r.lastName ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{r.firstName || <span className="text-red-500">required</span>}</td>
                    <td className="px-4 py-2 text-gray-700">{r.lastName || <span className="text-red-500">required</span>}</td>
                    <td className="px-4 py-2 text-gray-500">{r.dateOfBirth || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{r.gender || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{r.phone || '—'}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{r.studentNumber || 'auto'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Import Results</h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Total rows',  value: result.totalRows,    color: 'text-gray-800' },
              { label: 'Imported',    value: result.successCount, color: 'text-green-700' },
              { label: 'Failed',      value: result.failedCount,  color: result.failedCount > 0 ? 'text-red-600' : 'text-gray-400' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="mb-2 text-xs font-semibold text-red-700">Failed rows</p>
              <ul className="space-y-1">
                {result.errors.map((e) => (
                  <li key={e.row} className="text-xs text-red-600">
                    Row {e.row}: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/school-admin/students')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Students
            </button>
            {result.failedCount > 0 && (
              <button
                onClick={() => { setResult(null); setRows([]); setFileName(''); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Import more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
