import { httpClient } from '../../../shared/api/httpClient';

export type SchoolAdminResourceKey =
  | 'students'
  | 'parents'
  | 'teachers'
  | 'staff'
  | 'attendance'
  | 'homework'
  | 'exams'
  | 'fees'
  | 'notices'
  | 'timetable'
  | 'documents'
  | 'website';

export type ResourceConfig = {
  key: SchoolAdminResourceKey;
  label: string;
  listPath: string;
  createPath?: string;
  publishPath?: (id: string) => string;
  samplePayload?: unknown;
};

export const SCHOOL_ADMIN_RESOURCE_CONFIG: Record<SchoolAdminResourceKey, ResourceConfig> = {
  students: {
    key: 'students',
    label: 'Students',
    listPath: '/v1/school-admin/students',
  },
  parents: {
    key: 'parents',
    label: 'Parents',
    listPath: '/v1/school-admin/parents?size=50',
  },
  teachers: {
    key: 'teachers',
    label: 'Teachers',
    listPath: '/v1/school-admin/teachers?size=50',
  },
  staff: {
    key: 'staff',
    label: 'Staff',
    listPath: '/v1/school-admin/staff?size=50',
  },
  attendance: {
    key: 'attendance',
    label: 'Attendance sessions',
    listPath: '/v1/school-admin/attendance/sessions',
    createPath: '/v1/school-admin/attendance/sessions',
    samplePayload: {
      classLevelId: 'class-level-id',
      sectionId: 'section-id',
      subjectId: 'subject-id',
      attendanceDate: '2026-05-27',
      records: [
        {
          studentId: 'student-id',
          status: 'PRESENT',
        },
      ],
    },
  },
  homework: {
    key: 'homework',
    label: 'Homework',
    listPath: '/v1/school-admin/homework',
    createPath: '/v1/school-admin/homework',
    samplePayload: {
      classLevelId: 'class-level-id',
      sectionId: 'section-id',
      subjectId: 'subject-id',
      title: 'Chapter 1 practice',
      instructions: 'Complete the assigned questions.',
      dueDate: '2026-06-01',
    },
  },
  exams: {
    key: 'exams',
    label: 'Exams & results',
    listPath: '/v1/school-admin/exams',
    createPath: '/v1/school-admin/exams',
    publishPath: (id) => `/v1/school-admin/exams/${encodeURIComponent(id)}/publish`,
    samplePayload: {
      classLevelId: 'class-level-id',
      sectionId: 'section-id',
      subjectId: 'subject-id',
      title: 'Midterm Mathematics',
      examDate: '2026-06-15',
      maxMarks: 100,
    },
  },
  fees: {
    key: 'fees',
    label: 'Fee demands',
    listPath: '/v1/school-admin/fees/demands',
  },
  notices: {
    key: 'notices',
    label: 'Notices',
    listPath: '/v1/school-admin/notices',
    createPath: '/v1/school-admin/notices',
    publishPath: (id) => `/v1/school-admin/notices/${encodeURIComponent(id)}/publish`,
    samplePayload: {
      title: 'School update',
      body: 'This notice is ready to publish.',
      audience: 'SCHOOL',
    },
  },
  timetable: {
    key: 'timetable',
    label: 'Timetable',
    listPath: '/v1/school-admin/timetable',
    createPath: '/v1/school-admin/timetable',
    samplePayload: {
      classLevelId: 'class-level-id',
      sectionId: 'section-id',
      subjectId: 'subject-id',
      weekday: 'MONDAY',
      startTime: '09:00',
      endTime: '09:45',
      title: 'Mathematics',
    },
  },
  documents: {
    key: 'documents',
    label: 'Documents',
    listPath: '/v1/school-admin/documents',
    createPath: '/v1/school-admin/documents',
    samplePayload: {
      classLevelId: 'class-level-id',
      studentId: 'student-id',
      title: 'Transfer certificate',
      fileName: 'transfer-certificate.pdf',
      storageKey: 'documents/school/transfer-certificate.pdf',
    },
  },
  website: {
    key: 'website',
    label: 'Website pages',
    listPath: '/v1/school-admin/website/pages',
    createPath: '/v1/school-admin/website/pages',
    publishPath: (id) => `/v1/school-admin/website/pages/${encodeURIComponent(id)}/publish`,
    samplePayload: {
      slug: 'about-us',
      title: 'About our school',
      body: 'Write your school website content here.',
    },
  },
};

export async function listSchoolAdminResource(resource: SchoolAdminResourceKey, accessToken?: string | null) {
  const response = await httpClient.get<unknown>(SCHOOL_ADMIN_RESOURCE_CONFIG[resource].listPath, { accessToken });
  if (Array.isArray(response)) {
    return response;
  }
  if (typeof response === 'object' && response !== null && 'items' in response) {
    const items = (response as { items?: unknown }).items;
    return Array.isArray(items) ? items : [];
  }
  return [];
}

export function createSchoolAdminResource(resource: SchoolAdminResourceKey, payload: unknown, accessToken?: string | null) {
  const createPath = SCHOOL_ADMIN_RESOURCE_CONFIG[resource].createPath;
  if (!createPath) {
    throw new Error(`${SCHOOL_ADMIN_RESOURCE_CONFIG[resource].label} does not expose a create endpoint.`);
  }

  return httpClient.post<unknown>(createPath, payload, { accessToken });
}

export function publishSchoolAdminResource(resource: SchoolAdminResourceKey, id: string, accessToken?: string | null) {
  const publishPath = SCHOOL_ADMIN_RESOURCE_CONFIG[resource].publishPath;
  if (!publishPath) {
    throw new Error(`${SCHOOL_ADMIN_RESOURCE_CONFIG[resource].label} does not expose a publish endpoint.`);
  }

  return httpClient.post<unknown>(publishPath(id), undefined, { accessToken });
}
