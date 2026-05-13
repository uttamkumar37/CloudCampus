package com.cloudcampus.student.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.student.dto.AdmitStudentRequest;
import com.cloudcampus.student.dto.BulkImportResult;
import com.cloudcampus.student.dto.BulkStudentRow;
import com.cloudcampus.student.dto.RowError;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentSummaryResponse;
import com.cloudcampus.student.dto.UpdateStudentRequest;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
class StudentServiceImpl implements StudentService {

    private final StudentRepository    repo;
    private final BulkStudentImporter  bulkImporter;

    StudentServiceImpl(StudentRepository repo, BulkStudentImporter bulkImporter) {
        this.repo         = repo;
        this.bulkImporter = bulkImporter;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Write
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public StudentResponse admit(UUID schoolId, AdmitStudentRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        String number = resolveStudentNumber(schoolId, req.studentNumber());

        Student student = Student.create(tenantId, schoolId,
                number, req.firstName(), req.lastName(), req.admissionDate());

        student.setClassId(req.classId());
        student.setSectionId(req.sectionId());
        student.setDateOfBirth(req.dateOfBirth());
        student.setGender(req.gender());
        student.setBloodGroup(req.bloodGroup());
        student.setPhone(req.phone());
        student.setAddress(req.address());
        student.setPhotoUrl(req.photoUrl());

        return StudentResponse.from(repo.save(student));
    }

    @Override
    @Transactional
    public StudentResponse update(UUID id, UpdateStudentRequest req) {
        Student student = findOrThrow(id);

        student.setFirstName(req.firstName());
        student.setLastName(req.lastName());
        student.setDateOfBirth(req.dateOfBirth());
        student.setGender(req.gender());
        student.setBloodGroup(req.bloodGroup());
        student.setPhone(req.phone());
        student.setAddress(req.address());
        student.setPhotoUrl(req.photoUrl());
        student.setClassId(req.classId());
        student.setSectionId(req.sectionId());

        return StudentResponse.from(repo.save(student));
    }

    @Override
    @Transactional
    public StudentResponse graduate(UUID id) {
        return changeStatus(id, StudentStatus.GRADUATED, StudentStatus.ACTIVE);
    }

    @Override
    @Transactional
    public StudentResponse transfer(UUID id) {
        return changeStatus(id, StudentStatus.TRANSFERRED, StudentStatus.ACTIVE);
    }

    @Override
    @Transactional
    public StudentResponse suspend(UUID id) {
        return changeStatus(id, StudentStatus.SUSPENDED, StudentStatus.ACTIVE);
    }

    @Override
    @Transactional
    public StudentResponse reinstate(UUID id) {
        Student student = findOrThrow(id);
        if (student.getStatus() != StudentStatus.SUSPENDED) {
            throw new BadRequestException("Only SUSPENDED students can be reinstated");
        }
        student.setStatus(StudentStatus.ACTIVE);
        return StudentResponse.from(repo.save(student));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> listBySchool(UUID schoolId) {
        return repo.findAllBySchoolIdOrderByLastNameAscFirstNameAsc(schoolId)
                   .stream().map(StudentSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> listBySchoolAndStatus(UUID schoolId, StudentStatus status) {
        return repo.findAllBySchoolIdAndStatusOrderByLastNameAscFirstNameAsc(schoolId, status)
                   .stream().map(StudentSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> listByClass(UUID classId) {
        return repo.findAllByClassIdOrderByLastNameAscFirstNameAsc(classId)
                   .stream().map(StudentSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> listBySection(UUID sectionId) {
        return repo.findAllBySectionIdOrderByLastNameAscFirstNameAsc(sectionId)
                   .stream().map(StudentSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> search(UUID schoolId, String query) {
        if (query == null || query.isBlank()) {
            return listBySchool(schoolId);
        }
        return repo.searchByName(schoolId, query.trim())
                   .stream().map(StudentSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(UUID id) {
        return StudentResponse.from(findOrThrow(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Student findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Student not found: " + id));
    }

    private StudentResponse changeStatus(UUID id, StudentStatus target, StudentStatus required) {
        Student student = findOrThrow(id);
        if (student.getStatus() != required) {
            throw new BadRequestException(
                    "Cannot set status " + target + " — student must be " + required);
        }
        student.setStatus(target);
        return StudentResponse.from(repo.save(student));
    }

    /**
     * Returns the provided student number if non-blank, otherwise auto-generates
     * one using the pattern {@code {YEAR}-{seq}} (e.g. "2025-001").
     * The sequence is 1-based count of students already admitted for the same
     * school in the current calendar year.
     */
    @Override
    public BulkImportResult bulkAdmit(UUID schoolId, List<BulkStudentRow> rows) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        List<RowError> errors = new ArrayList<>();
        int success = 0;
        for (int i = 0; i < rows.size(); i++) {
            try {
                bulkImporter.importRow(tenantId, schoolId, rows.get(i));
                success++;
            } catch (Exception e) {
                String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                errors.add(new RowError(i + 1, reason));
            }
        }
        return new BulkImportResult(rows.size(), success, errors.size(), errors);
    }

    private String resolveStudentNumber(UUID schoolId, String provided) {
        if (provided != null && !provided.isBlank()) {
            if (repo.existsBySchoolIdAndStudentNumber(schoolId, provided.trim())) {
                throw new BadRequestException(
                        "Student number '" + provided + "' is already in use for this school");
            }
            return provided.trim();
        }
        String yearPrefix = String.valueOf(Year.now().getValue()) + "-";
        long count = repo.countBySchoolIdAndStudentNumberPrefix(schoolId, yearPrefix);
        // Pad to 3 digits minimum; auto-increments beyond 999 without padding change.
        String candidate;
        long seq = count + 1;
        do {
            candidate = yearPrefix + String.format("%03d", seq);
            seq++;
        } while (repo.existsBySchoolIdAndStudentNumber(schoolId, candidate));
        return candidate;
    }
}
