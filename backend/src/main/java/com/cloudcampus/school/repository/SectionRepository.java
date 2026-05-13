package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    List<Section> findAllByClassIdOrderByNameAsc(UUID classId);

    List<Section> findAllBySchoolIdOrderByNameAsc(UUID schoolId);

    Optional<Section> findByClassIdAndName(UUID classId, String name);

    boolean existsByClassIdAndName(UUID classId, String name);
}
