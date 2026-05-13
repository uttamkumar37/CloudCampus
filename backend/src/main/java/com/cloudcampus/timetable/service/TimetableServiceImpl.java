package com.cloudcampus.timetable.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.timetable.dto.TimetableSlotCreateRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;

    public TimetableServiceImpl(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
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
        return timetableRepository
                .findBySchoolIdAndAcademicYearIdAndClassIdAndSectionId(schoolId, academicYearId, classId, sectionId)
                .stream()
                .map(TimetableSlotResponse::from)
                .toList();
    }

    @Override
    public List<TimetableSlotResponse> listSlotsByStaff(UUID schoolId, UUID academicYearId, UUID staffId) {
        return timetableRepository
                .findBySchoolIdAndAcademicYearIdAndStaffId(schoolId, academicYearId, staffId)
                .stream()
                .map(TimetableSlotResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSlot(UUID schoolId, UUID slotId) {
        TimetableSlot slot = timetableRepository.findBySchoolIdAndId(schoolId, slotId)
                .orElseThrow(() -> new NotFoundException("Timetable slot not found"));
        timetableRepository.delete(slot);
    }
}
