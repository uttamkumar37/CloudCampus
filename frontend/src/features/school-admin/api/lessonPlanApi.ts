import axiosInstance from '@/shared/api/axiosInstance';

export interface LessonPlanResponse {
  id: string;
  staffId: string;
  classId: string | null;
  sectionId: string | null;
  subjectId: string | null;
  planDate: string;
  periodNumber: number | null;
  topic: string;
  objectives: string | null;
  activities: string | null;
  materials: string | null;
  homeworkNote: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface LessonPlanRequest {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  academicYearId?: string;
  planDate: string;
  periodNumber?: number;
  topic: string;
  objectives?: string;
  activities?: string;
  materials?: string;
  homeworkNote?: string;
  publish?: boolean;
}

export async function listMyPlansApi(from: string, to: string): Promise<LessonPlanResponse[]> {
  const res = await axiosInstance.get('/teacher/lesson-plans', { params: { from, to } });
  return res.data.data;
}

export async function createPlanApi(req: LessonPlanRequest): Promise<LessonPlanResponse> {
  const res = await axiosInstance.post('/teacher/lesson-plans', req);
  return res.data.data;
}

export async function updatePlanApi(planId: string, req: LessonPlanRequest): Promise<LessonPlanResponse> {
  const res = await axiosInstance.put(`/teacher/lesson-plans/${planId}`, req);
  return res.data.data;
}

export async function publishPlanApi(planId: string): Promise<LessonPlanResponse> {
  const res = await axiosInstance.post(`/teacher/lesson-plans/${planId}/publish`);
  return res.data.data;
}

export async function deletePlanApi(planId: string): Promise<void> {
  await axiosInstance.delete(`/teacher/lesson-plans/${planId}`);
}

export async function listSchoolPlansApi(from: string, to: string): Promise<LessonPlanResponse[]> {
  const res = await axiosInstance.get('/school-admin/lesson-plans', { params: { from, to } });
  return res.data.data;
}
