package com.cloudcampus.timetable.service;

import com.cloudcampus.timetable.dto.TimetableSlotCreateRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;

import java.util.List;
import java.util.UUID;

public interface TimetableService {

    TimetableSlotResponse addSlot(UUID tenantId, UUID schoolId, TimetableSlotCreateRequest request);

    List<TimetableSlotResponse> listSlots(UUID schoolId, UUID academicYearId, UUID classId, UUID sectionId);

    /** Returns all slots for a specific teacher (staff) in an academic year. */
    List<TimetableSlotResponse> listSlotsByStaff(UUID schoolId, UUID academicYearId, UUID staffId);

    void deleteSlot(UUID schoolId, UUID slotId);
}
