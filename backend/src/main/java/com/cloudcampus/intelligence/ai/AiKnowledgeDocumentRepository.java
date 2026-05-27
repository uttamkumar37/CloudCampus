package com.cloudcampus.intelligence.ai;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AiKnowledgeDocumentRepository extends JpaRepository<AiKnowledgeDocument, String> {

    List<AiKnowledgeDocument> findBySchoolIdAndStatusOrderByCreatedAtDesc(
            String schoolId,
            AiKnowledgeDocumentStatus status
    );
}
