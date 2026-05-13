package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.AdmitStudentRequest;
import com.cloudcampus.student.dto.BulkImportResult;
import com.cloudcampus.student.dto.BulkStudentRow;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentSummaryResponse;
import com.cloudcampus.student.dto.UpdateStudentRequest;
import com.cloudcampus.student.entity.StudentStatus;

import java.util.List;
import java.util.UUID;

/**
 * Student lifecycle management (CC-0501 – CC-0504).
 */
public interface StudentService {

    /** Admit a new student and persist the record. */
    StudentResponse admit(UUID schoolId, AdmitStudentRequest request);

    /** Full student list for a school — all statuses (for admin views). */
    List<StudentSummaryResponse> listBySchool(UUID schoolId);

    /** Students filtered by status (most common: ACTIVE). */
    List<StudentSummaryResponse> listBySchoolAndStatus(UUID schoolId, StudentStatus status);

    /** Students in a specific class (roster view). */
    List<StudentSummaryResponse> listByClass(UUID classId);

    /** Students in a specific section (attendance sheet). */
    List<StudentSummaryResponse> listBySection(UUID sectionId);

    /** Quick name-based search within a school. */
    List<StudentSummaryResponse> search(UUID schoolId, String query);

    /** Full student profile (CC-0503). */
    StudentResponse getById(UUID id);

    /** Update personal / placement details (CC-0503). */
    StudentResponse update(UUID id, UpdateStudentRequest request);

    /** Mark student as graduated. */
    StudentResponse graduate(UUID id);

    /** Mark student as transferred. */
    StudentResponse transfer(UUID id);

    /** Suspend student (disciplinary). */
    StudentResponse suspend(UUID id);

    /** Lift suspension — returns to ACTIVE. */
    StudentResponse reinstate(UUID id);

    /** Import multiple students from a JSON payload derived from a CSV upload (CC-0508). */
    BulkImportResult bulkAdmit(UUID schoolId, List<BulkStudentRow> rows);
}
