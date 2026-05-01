package com.cloudcampus.timetable.service;

import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.timetable.dto.TimetableSlotRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimetableServiceImpl implements TimetableService {

    private final TimetableSlotRepository timetableSlotRepository;

    @Override
    @Transactional
    public TimetableSlotResponse create(TimetableSlotRequest request) {
        validateTenant();
        TimetableSlot slot = new TimetableSlot();
        slot.setClassId(request.classId());
        slot.setSectionId(request.sectionId());
        slot.setSubjectId(request.subjectId());
        slot.setTeacherId(request.teacherId());
        slot.setDayOfWeek(request.dayOfWeek());
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setLabel(request.label());
        return map(timetableSlotRepository.save(slot));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableSlotResponse> list(UUID classId, UUID sectionId) {
        validateTenant();
        return timetableSlotRepository.findByClassIdAndSectionIdOrderByDayOfWeekAscStartTimeAsc(classId, sectionId)
                .stream()
                .map(this::map)
                .toList();
    }

    private TimetableSlotResponse map(TimetableSlot s) {
        return new TimetableSlotResponse(
                s.getId(),
                s.getClassId(),
                s.getSectionId(),
                s.getSubjectId(),
                s.getTeacherId(),
                s.getDayOfWeek(),
                s.getStartTime(),
                s.getEndTime(),
                s.getLabel(),
                s.getCreatedAt()
        );
    }

    private void validateTenant() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required");
        }
    }
}
