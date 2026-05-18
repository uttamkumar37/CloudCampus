package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.BrandSystem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BrandSystemRepository extends JpaRepository<BrandSystem, UUID> {
    List<BrandSystem> findAllByOrderByUpdatedAtDesc();

    Optional<BrandSystem> findFirstByCodeAndPublishedTrueOrderByUpdatedAtDesc(String code);

    Optional<BrandSystem> findFirstByPublishedTrueOrderByUpdatedAtDesc();
}
