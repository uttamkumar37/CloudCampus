package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.StudentDocument;

import java.time.Instant;
import java.util.UUID;

public record StudentDocumentResponse(
        UUID    id,
        UUID    studentId,
        String  documentType,
        String  fileName,
        String  mimeType,
        long    sizeBytes,
        UUID    uploadedBy,
        Instant uploadedAt
) {
    public static StudentDocumentResponse from(StudentDocument d) {
        return new StudentDocumentResponse(
                d.getId(), d.getStudentId(), d.getDocumentType(),
                d.getFileName(), d.getMimeType(), d.getSizeBytes(),
                d.getUploadedBy(), d.getUploadedAt());
    }
}
