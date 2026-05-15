package com.cloudcampus.timetable.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.school.entity.Subject;
import com.cloudcampus.school.repository.SubjectRepository;
import com.cloudcampus.timetable.dto.TimetableSlotCreateRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final SubjectRepository   subjectRepository;

    public TimetableServiceImpl(TimetableRepository timetableRepository,
                                SubjectRepository   subjectRepository) {
        this.timetableRepository = timetableRepository;
        this.subjectRepository   = subjectRepository;
    }

    private List<TimetableSlotResponse> enrich(List<TimetableSlot> slots) {
        Set<UUID> subjectIds = slots.stream()
                .map(TimetableSlot::getSubjectId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds)
                .stream().collect(Collectors.toMap(Subject::getId, s -> s));
        return slots.stream()
                .map(s -> {
                    Subject sub = s.getSubjectId() != null ? subjectMap.get(s.getSubjectId()) : null;
                    return TimetableSlotResponse.from(s,
                            sub != null ? sub.getName() : null,
                            sub != null ? sub.getCode() : null);
                })
                .toList();
    }

    @Override
    @Transactional
    public TimetableSlotResponse addSlot(UUID tenantId, UUID schoolId, TimetableSlotCreateRequest req) {
        if (req.endTime() != null && req.startTime() != null && req.endTime().isBefore(req.startTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        short period = req.periodNumber().shortValue();

        // Section double-booking guard
        timetableRepository.findBySchoolIdAndAcademicYearIdAndClassIdAndSectionIdAndDayOfWeekAndPeriodNumber(
                schoolId, req.academicYearId(), req.classId(), req.sectionId(), req.dayOfWeek(), period
        ).ifPresent(existing -> {
            throw new ConflictException(
                    "Period " + period + " on " + req.dayOfWeek() + " is already occupied for this class/section");
        });

        // Teacher double-booking guard
        if (req.staffId() != null) {
            timetableRepository.findTeacherConflict(
                    schoolId, req.academicYearId(), req.staffId(), req.dayOfWeek(), period
            ).ifPresent(existing -> {
                throw new ConflictException(
                        "Teacher is already assigned to another class on " + req.dayOfWeek() + " period " + period);
            });
        }

        TimetableSlot slot = TimetableSlot.create(
                tenantId, schoolId, req.academicYearId(),
                req.classId(), req.sectionId(), req.subjectId(),
                req.staffId(), req.dayOfWeek(), period,
                req.startTime(), req.endTime()
        );
        timetableRepository.save(slot);
        return TimetableSlotResponse.from(slot);
    }

    @Override
    public List<TimetableSlotResponse> listSlots(UUID schoolId, UUID academicYearId, UUID classId, UUID sectionId) {
        return enrich(timetableRepository
                .findBySchoolIdAndAcademicYearIdAndClassIdAndSectionId(schoolId, academicYearId, classId, sectionId));
    }

    @Override
    public List<TimetableSlotResponse> listSlotsByStaff(UUID schoolId, UUID academicYearId, UUID staffId) {
        return enrich(timetableRepository
                .findBySchoolIdAndAcademicYearIdAndStaffId(schoolId, academicYearId, staffId));
    }

    @Override
    @Transactional
    public void deleteSlot(UUID schoolId, UUID slotId) {
        TimetableSlot slot = timetableRepository.findBySchoolIdAndId(schoolId, slotId)
                .orElseThrow(() -> new NotFoundException("Timetable slot not found"));
        timetableRepository.delete(slot);
    }
}
