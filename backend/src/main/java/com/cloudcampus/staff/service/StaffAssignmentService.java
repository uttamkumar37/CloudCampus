package com.cloudcampus.staff.service;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class StaffAssignmentService {

    private final TimetableRepository timetableRepository;

    public StaffAssignmentService(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }

    public List<TimetableSlot> listAssignedSlots(UUID schoolId, UUID staffId) {
        return timetableRepository.findBySchoolIdAndStaffId(schoolId, staffId);
    }

    public void assertAssignedToAcademicWork(
            UUID schoolId,
            UUID staffId,
            UUID academicYearId,
            UUID classId,
            UUID sectionId,
            UUID subjectId) {

        boolean assigned = sectionId != null
                ? timetableRepository.existsBySchoolIdAndAcademicYearIdAndClassIdAndSectionIdAndSubjectIdAndStaffId(
                        schoolId, academicYearId, classId, sectionId, subjectId, staffId)
                : timetableRepository.existsBySchoolIdAndAcademicYearIdAndClassIdAndSubjectIdAndStaffId(
                        schoolId, academicYearId, classId, subjectId, staffId);

        if (!assigned) {
            throw new ForbiddenException("Teacher is not assigned to this class, section, and subject");
        }
    }
}
