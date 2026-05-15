package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.StudentDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface StudentDocumentService {

    StudentDocumentResponse upload(UUID schoolId, UUID studentId, String documentType, MultipartFile file);

    List<StudentDocumentResponse> list(UUID schoolId, UUID studentId);

    String presignedUrl(UUID schoolId, UUID studentId, UUID documentId);

    void delete(UUID schoolId, UUID studentId, UUID documentId);
}
