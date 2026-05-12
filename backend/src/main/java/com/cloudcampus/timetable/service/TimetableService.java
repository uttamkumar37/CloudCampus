package com.cloudcampus.timetable.service;

import com.cloudcampus.timetable.dto.TimetableSlotCreateRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;

import java.util.List;
import java.util.UUID;

public interface TimetableService {

    TimetableSlotResponse addSlot(UUID tenantId, UUID schoolId, TimetableSlotCreateRequest request);

    List<TimetableSlotResponse> listSlots(UUID schoolId, UUID academicYearId, UUID classId, UUID sectionId);

    void deleteSlot(UUID schoolId, UUID slotId);
}
