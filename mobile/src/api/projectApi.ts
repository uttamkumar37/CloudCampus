import { api } from './client';
import type { StoredSession } from '../auth/storage';

export interface PageResponse<T> {
  items: T[];
  offset: number;
  limit: number;
  total: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
}

export interface SchoolAccess {
  schoolId: string;
  schoolName?: string;
  name?: string;
  code?: string;
  isPrimary?: boolean;
  active?: boolean;
}

export interface NoticeSummary {
  id: string;
  title: string;
  category?: string;
  target?: string;
  priority?: string;
  publishedAt?: string;
}

export interface SyncCard {
  key: string;
  title: string;
  endpoint: string;
  status: 'ok' | 'empty' | 'error' | 'skipped';
  summary: string;
  details: string[];
}

export interface ProjectSnapshot {
  schools: SchoolAccess[];
  notices: NoticeSummary[];
  cards: SyncCard[];
  loadedAt: string;
}

type User = StoredSession['user'];

function dataOf<T>(payload: ApiEnvelope<T>): T {
  if (!payload?.success) {
    throw new Error(payload?.error?.message ?? 'API request failed');
  }
  return payload.data;
}

async function get<T>(endpoint: string): Promise<T> {
  const resp = await api.get<ApiEnvelope<T>>(endpoint);
  return dataOf(resp.data);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray((value as PageResponse<unknown>).items)) {
    return (value as PageResponse<unknown>).items;
  }
  return [];
}

function pageTotal(value: unknown): number | null {
  if (value && typeof value === 'object' && typeof (value as PageResponse<unknown>).total === 'number') {
    return (value as PageResponse<unknown>).total;
  }
  return null;
}

function pickString(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  for (const key of keys) {
    const raw = row[key];
    if (raw !== null && raw !== undefined && raw !== '') return String(raw);
  }
  return null;
}

function compactDetails(items: unknown[], keys: string[]): string[] {
  return items.slice(0, 3).map((item, index) => {
    const text = pickString(item, keys);
    return text ?? `Item ${index + 1}`;
  });
}

function summarizeObject(value: Record<string, unknown>): string[] {
  return Object.entries(value)
    .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${String(v)}`);
}

async function card(
  key: string,
  title: string,
  endpoint: string,
  labels: string[],
): Promise<SyncCard> {
  try {
    const data = await get<unknown>(endpoint);
    const items = asArray(data);
    if (items.length > 0) {
      const total = pageTotal(data);
      return {
        key,
        title,
        endpoint,
        status: 'ok',
        summary: `${total ?? items.length} record${(total ?? items.length) === 1 ? '' : 's'}`,
        details: compactDetails(items, labels),
      };
    }
    if (data && typeof data === 'object') {
      const details = summarizeObject(data as Record<string, unknown>);
      return {
        key,
        title,
        endpoint,
        status: details.length ? 'ok' : 'empty',
        summary: details.length ? 'Live summary loaded' : 'No data yet',
        details,
      };
    }
    return { key, title, endpoint, status: 'empty', summary: 'No data yet', details: [] };
  } catch (error) {
    const message =
      (error as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response?.data?.error?.message ??
      (error as Error)?.message ??
      'Request failed';
    return { key, title, endpoint, status: 'error', summary: message, details: [] };
  }
}

function skipped(key: string, title: string, summary: string): SyncCard {
  return { key, title, endpoint: '-', status: 'skipped', summary, details: [] };
}

export async function fetchProjectSnapshot(user: User): Promise<ProjectSnapshot> {
  const cards: SyncCard[] = [];

  const schools = await card('schools', 'My schools', '/v1/me/schools', ['schoolName', 'name', 'code']);
  cards.push(schools);

  const notices = await card('mobile-notices', 'Mobile notices', '/v1/mobile/notices?page=0&limit=5', [
    'title',
    'category',
  ]);
  cards.push(notices);

  if (user.role === 'STUDENT') {
    cards.push(
      await card('student-attendance', 'My attendance', '/v1/student/attendance', ['attendancePct', 'status']),
      await card('student-homework', 'Homework', '/v1/student/homework', ['title', 'subjectName']),
      await card('student-assignments', 'Assignments', '/v1/student/assignments', ['title', 'assignmentStatus']),
      await card('student-timetable', 'Timetable', '/v1/student/timetable', ['subjectName', 'dayOfWeek']),
      await card('student-results', 'Results', '/v1/student/results', ['examName', 'grade']),
      await card('student-fees', 'Fees', '/v1/student/fees', ['feeCategoryName', 'status']),
      await card('student-profile', 'Profile 360', '/v1/student/profile-360', ['fullName', 'studentNumber']),
    );
  } else if (user.role === 'PARENT') {
    const children = await get<unknown[]>('/v1/parent/children').catch(() => []);
    cards.push({
      key: 'parent-children',
      title: 'Linked children',
      endpoint: '/v1/parent/children',
      status: children.length ? 'ok' : 'empty',
      summary: `${children.length} child${children.length === 1 ? '' : 'ren'}`,
      details: compactDetails(children, ['firstName', 'lastName', 'studentNumber']),
    });
    const firstChild = children[0] as { studentId?: string } | undefined;
    if (firstChild?.studentId) {
      const base = `/v1/parent/children/${firstChild.studentId}`;
      cards.push(
        await card('parent-attendance', 'Child attendance', `${base}/attendance`, ['attendancePct', 'present']),
        await card('parent-results', 'Child results', `${base}/results`, ['examName', 'grade']),
        await card('parent-homework', 'Child homework', `${base}/homework`, ['title', 'subjectName']),
        await card('parent-timetable', 'Child timetable', `${base}/timetable`, ['subjectName', 'dayOfWeek']),
        await card('parent-fees', 'Child fees', `${base}/fees`, ['feeCategoryName', 'status']),
      );
    } else {
      cards.push(skipped('parent-child-detail', 'Child details', 'No linked child was returned.'));
    }
  } else if (user.role === 'TEACHER') {
    cards.push(
      await card('teacher-dashboard', 'Teacher dashboard', '/v1/teacher/dashboard', ['pendingHomeworkReview']),
      await card('teacher-timetable', 'Timetable', '/v1/teacher/timetable', ['subjectName', 'dayOfWeek']),
      await card('teacher-homework', 'Homework review', '/v1/teacher/homework', ['title', 'status']),
      await card('teacher-assignments', 'Assignment grading', '/v1/teacher/assignments', ['title', 'status']),
    );
  } else if (user.role === 'SCHOOL_ADMIN' && user.schoolId) {
    const schoolBase = `/v1/school-admin/schools/${user.schoolId}`;
    cards.push(
      await card('admin-dashboard', 'School dashboard', `${schoolBase}/dashboard`, ['totalStudents']),
      await card('admin-academic-years', 'Academic years', `${schoolBase}/academic-years`, ['name', 'status']),
      await card('admin-classes', 'Classes', `${schoolBase}/classes`, ['name', 'grade']),
      await card('admin-students', 'Students', `${schoolBase}/students`, ['firstName', 'lastName', 'studentNumber']),
      await card('admin-subjects', 'Subjects', `${schoolBase}/subjects`, ['name', 'code']),
      await card('admin-fees', 'Fee records', `${schoolBase}/fee-records`, ['studentName', 'status']),
      await card('admin-notices', 'School notices', `${schoolBase}/notices?page=0&size=5`, ['title', 'category']),
    );
  } else {
    cards.push(
      skipped(
        'role-scope',
        'Role workspace',
        user.role === 'SUPER_ADMIN'
          ? 'Super admin mobile is limited to session and public/mobile checks. Use web for platform administration.'
          : `No dedicated mobile read model is configured for ${user.role}.`,
      ),
    );
  }

  return {
    schools: schools.status === 'ok' ? (await get<SchoolAccess[]>('/v1/me/schools').catch(() => [])) : [],
    notices: notices.status === 'ok'
      ? ((await get<PageResponse<NoticeSummary>>('/v1/mobile/notices?page=0&limit=5').catch(() => ({ items: [] }))).items ?? [])
      : [],
    cards,
    loadedAt: new Date().toISOString(),
  };
}
