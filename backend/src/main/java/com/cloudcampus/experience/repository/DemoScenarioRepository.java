package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.DemoScenario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DemoScenarioRepository extends JpaRepository<DemoScenario, UUID> {

    Optional<DemoScenario> findBySlugAndStatus(String slug, String status);

    List<DemoScenario> findByStatusOrderByDisplayOrderAsc(String status);
}
