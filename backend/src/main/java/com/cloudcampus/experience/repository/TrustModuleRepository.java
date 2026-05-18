package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.TrustModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TrustModuleRepository extends JpaRepository<TrustModule, UUID> {
    List<TrustModule> findAllByOrderByUpdatedAtDesc();

    List<TrustModule> findByPublishedTrueOrderByUpdatedAtDesc();
}
