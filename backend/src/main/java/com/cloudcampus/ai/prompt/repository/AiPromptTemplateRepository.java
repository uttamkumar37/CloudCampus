package com.cloudcampus.ai.prompt.repository;

import com.cloudcampus.ai.prompt.entity.AiPromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiPromptTemplateRepository extends JpaRepository<AiPromptTemplate, UUID> {

    List<AiPromptTemplate> findByPromptKeyOrderByVersionDesc(String promptKey);

    Optional<AiPromptTemplate> findByPromptKeyAndActiveTrue(String promptKey);

    @Query("SELECT MAX(t.version) FROM AiPromptTemplate t WHERE t.promptKey = :key")
    Optional<Integer> findMaxVersionByPromptKey(@Param("key") String promptKey);

    @Modifying
    @Query("UPDATE AiPromptTemplate t SET t.active = false WHERE t.promptKey = :key AND t.active = true")
    void deactivateAllByPromptKey(@Param("key") String promptKey);

    List<AiPromptTemplate> findAllByOrderByPromptKeyAscVersionDesc();
}
