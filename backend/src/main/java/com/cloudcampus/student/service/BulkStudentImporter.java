package com.cloudcampus.student.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.student.dto.BulkStudentRow;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.UUID;

/**
 * Isolated per-row transaction helper for bulk student import (CC-0508).
 *
 * Each call to {@link #importRow} runs in its own REQUIRES_NEW transaction
 * so that a single row failure does not roll back successfully imported rows.
 */
@Component
class BulkStudentImporter {

    private final StudentRepository repo;

    BulkStudentImporter(StudentRepository repo) {
        this.repo = repo;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void importRow(UUID tenantId, UUID schoolId, BulkStudentRow row) {
        if (row.firstName() == null || row.firstName().isBlank()) {
            throw new BadRequestException("firstName is required");
        }
        if (row.lastName() == null || row.lastName().isBlank()) {
            throw new BadRequestException("lastName is required");
        }

        String number = resolveStudentNumber(schoolId, row.studentNumber());

        Student s = Student.create(tenantId, schoolId, number,
                row.firstName().trim(), row.lastName().trim(), row.admissionDate());
        s.setClassId(row.classId());
        s.setSectionId(row.sectionId());
        if (row.dateOfBirth() != null) s.setDateOfBirth(row.dateOfBirth());
        if (row.gender() != null)      s.setGender(row.gender());
        if (row.phone() != null)       s.setPhone(row.phone().trim());

        repo.save(s);
    }

    private String resolveStudentNumber(UUID schoolId, String provided) {
        if (provided != null && !provided.isBlank()) {
            if (repo.existsBySchoolIdAndStudentNumber(schoolId, provided.trim())) {
                throw new BadRequestException("Student number '" + provided + "' already exists");
            }
            return provided.trim();
        }
        String yearPrefix = Year.now().getValue() + "-";
        long count = repo.countBySchoolIdAndStudentNumberPrefix(schoolId, yearPrefix);
        String candidate;
        long seq = count + 1;
        do {
            candidate = yearPrefix + String.format("%03d", seq++);
        } while (repo.existsBySchoolIdAndStudentNumber(schoolId, candidate));
        return candidate;
    }
}
