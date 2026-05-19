package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, UUID> {

    List<StudentDocument> findByStudentIdOrderByUploadedAtDesc(UUID studentId);

    long countByStudentId(UUID studentId);

    Optional<StudentDocument> findByIdAndStudentId(UUID id, UUID studentId);

    @Query("SELECT COALESCE(SUM(d.sizeBytes), 0) FROM StudentDocument d WHERE d.tenantId = :tenantId")
    long sumSizeBytesByTenantId(UUID tenantId);
}
