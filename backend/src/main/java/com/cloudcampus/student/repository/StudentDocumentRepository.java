package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, UUID> {

    List<StudentDocument> findByStudentIdOrderByUploadedAtDesc(UUID studentId);

    Optional<StudentDocument> findByIdAndStudentId(UUID id, UUID studentId);
}
