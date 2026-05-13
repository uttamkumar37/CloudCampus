import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { TimetableSlot, TimetableSlotCreateRequest } from '../types/timetable';

const base = '/v1/school-admin';

export async function listTimetableSlots(
  schoolId: string,
  academicYearId: string,
  classId: string,
  sectionId: string,
): Promise<TimetableSlot[]> {
  const { data } = await axiosInstance.get<ApiResponse<TimetableSlot[]>>(
    `${base}/schools/${schoolId}/timetable`,
    { params: { academicYearId, classId, sectionId } },
  );
  return data.data ?? [];
}

export async function addTimetableSlot(
  schoolId: string,
  body: TimetableSlotCreateRequest,
): Promise<TimetableSlot> {
  const { data } = await axiosInstance.post<ApiResponse<TimetableSlot>>(
    `${base}/schools/${schoolId}/timetable`,
    body,
  );
  return data.data!;
}

export async function deleteTimetableSlot(schoolId: string, slotId: string): Promise<void> {
  await axiosInstance.delete(`${base}/schools/${schoolId}/timetable/${slotId}`);
}
