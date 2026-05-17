package com.cloudcampus.student.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.student.dto.StudentDocumentResponse;
import com.cloudcampus.student.entity.StudentDocument;
import com.cloudcampus.student.repository.StudentDocumentRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class StudentDocumentServiceImpl implements StudentDocumentService {

    private final StudentRepository         studentRepo;
    private final StudentDocumentRepository documentRepo;
    private final StorageService            storage;

    public StudentDocumentServiceImpl(StudentRepository studentRepo,
                                       StudentDocumentRepository documentRepo,
                                       StorageService storage) {
        this.studentRepo  = studentRepo;
        this.documentRepo = documentRepo;
        this.storage      = storage;
    }

    @Override
    @Transactional
    public StudentDocumentResponse upload(UUID schoolId, UUID studentId, String documentType, MultipartFile file) {
        validateStudent(studentId, schoolId);

        UUID   tenantId      = UUID.fromString(RequestContext.getTenantId());
        UUID   uploadedBy    = RequestContext.getUserId();
        String safeFilename  = sanitizeFilename(file.getOriginalFilename());
        String objectKey     = buildObjectKey(tenantId, schoolId, studentId, safeFilename);

        storage.upload(objectKey, file);

        StudentDocument doc = StudentDocument.create(
                tenantId, schoolId, studentId,
                documentType,
                safeFilename,
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize(),
                objectKey,
                uploadedBy);

        return StudentDocumentResponse.from(documentRepo.save(doc));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDocumentResponse> list(UUID schoolId, UUID studentId) {
        validateStudent(studentId, schoolId);
        return documentRepo.findByStudentIdOrderByUploadedAtDesc(studentId)
                .stream().map(StudentDocumentResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String presignedUrl(UUID schoolId, UUID studentId, UUID documentId) {
        validateStudent(studentId, schoolId);
        StudentDocument doc = documentRepo.findByIdAndStudentId(documentId, studentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));
        return storage.presignedGetUrl(doc.getObjectKey());
    }

    @Override
    @Transactional
    public void delete(UUID schoolId, UUID studentId, UUID documentId) {
        validateStudent(studentId, schoolId);
        StudentDocument doc = documentRepo.findByIdAndStudentId(documentId, studentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));
        storage.delete(doc.getObjectKey());
        documentRepo.delete(doc);
    }

    private void validateStudent(UUID studentId, UUID schoolId) {
        studentRepo.findById(studentId)
                .filter(s -> s.getSchoolId().equals(schoolId))
                .orElseThrow(() -> new NotFoundException("Student not found in this school"));
    }

    // L-10: strip path separators and HTML-significant chars from the filename
    // before storing in the DB. A crafted filename like "<script>alert(1)</script>.pdf"
    // could cause XSS if rendered without escaping in downstream admin UIs.
    private static String sanitizeFilename(String raw) {
        if (raw == null || raw.isBlank()) return "upload";
        String name = raw
                .replaceAll("[/\\\\]", "")          // strip path separators
                .replaceAll("[<>\"'&;]", "")         // strip HTML/script chars
                .replaceAll("\\s+", "_")             // collapse whitespace
                .trim();
        // Extract extension from the sanitized name and cap total length at 200 chars
        if (name.length() > 200) name = name.substring(0, 200);
        return name.isBlank() ? "upload" : name;
    }

    private String buildObjectKey(UUID tenantId, UUID schoolId, UUID studentId, String originalFilename) {
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        return String.format("documents/%s/%s/%s/%s%s",
                tenantId, schoolId, studentId, UUID.randomUUID(), ext);
    }
}
