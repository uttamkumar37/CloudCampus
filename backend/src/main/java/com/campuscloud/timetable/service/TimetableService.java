package com.campuscloud.timetable.service;

import com.campuscloud.timetable.dto.TimetableSlotRequest;
import com.campuscloud.timetable.dto.TimetableSlotResponse;

import java.util.List;
import java.util.UUID;

public interface TimetableService {

    TimetableSlotResponse create(TimetableSlotRequest request);

    List<TimetableSlotResponse> list(UUID classId, UUID sectionId);
}
