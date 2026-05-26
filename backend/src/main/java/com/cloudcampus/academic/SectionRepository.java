package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, String> {

    List<Section> findByClassLevelIdOrderByNameAsc(String classLevelId);

    Optional<Section> findByClassLevelIdAndName(String classLevelId, String name);
}
