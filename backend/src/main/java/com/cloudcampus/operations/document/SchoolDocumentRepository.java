package com.cloudcampus.operations.document;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolDocumentRepository extends JpaRepository<SchoolDocument, String> {

    List<SchoolDocument> findBySchoolIdOrderByCreatedAtDesc(String schoolId);
}
