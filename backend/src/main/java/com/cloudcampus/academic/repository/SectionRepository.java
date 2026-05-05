package com.cloudcampus.academic.repository;

import com.cloudcampus.academic.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {

	boolean existsBySchoolClass_IdAndNameIgnoreCase(UUID classId, String name);
}
