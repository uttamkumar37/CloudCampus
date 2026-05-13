package com.cloudcampus.exam.service;

import com.cloudcampus.exam.dto.BulkMarksEntryRequest;
import com.cloudcampus.exam.dto.MarksEntryRequest;
import com.cloudcampus.exam.dto.StudentMarkResponse;

import java.util.List;
import java.util.UUID;

/**
 * Business logic for the marks entry system (CC-1102).
 */
public interface MarksService {

    /**
     * Bulk upsert marks for all students in one exam paper.
     * Creates a new record if none exists; updates the existing one otherwise.
     * Validates that {@code marks_obtained ≤ exam_subject.total_marks}.
     *
     * @param tenantId       tenant scope (from JWT)
     * @param schoolId       school scope (from path)
     * @param examId         parent exam
     * @param subjectEntryId the exam_subject (paper) UUID
     * @param request        list of per-student mark entries
     * @param enteredBy      staff UUID saving the marks
     * @return saved/updated mark records
     */
    List<StudentMarkResponse> bulkSave(
            UUID tenantId,
            UUID schoolId,
            UUID examId,
            UUID subjectEntryId,
            BulkMarksEntryRequest request,
            UUID enteredBy);

    /**
     * List all marks recorded for a specific exam paper.
     *
     * @param schoolId       school scope
     * @param examId         parent exam
     * @param subjectEntryId exam_subject UUID
     * @return marks ordered by student UUID
     */
    List<StudentMarkResponse> listBySubject(UUID schoolId, UUID examId, UUID subjectEntryId);

    /**
     * Update a single mark entry.
     *
     * @param schoolId       school scope
     * @param examId         parent exam
     * @param subjectEntryId exam_subject UUID
     * @param markId         specific mark record UUID
     * @param request        updated values
     * @param enteredBy      staff UUID saving the update
     * @return updated record
     */
    StudentMarkResponse update(
            UUID schoolId,
            UUID examId,
            UUID subjectEntryId,
            UUID markId,
            MarksEntryRequest request,
            UUID enteredBy);

    /**
     * Delete a single mark entry (re-opens the slot for re-entry).
     *
     * @param schoolId       school scope
     * @param examId         parent exam
     * @param subjectEntryId exam_subject UUID
     * @param markId         specific mark record UUID
     */
    void delete(UUID schoolId, UUID examId, UUID subjectEntryId, UUID markId);
}
