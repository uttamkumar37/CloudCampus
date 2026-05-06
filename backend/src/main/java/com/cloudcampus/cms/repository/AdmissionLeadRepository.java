package com.cloudcampus.cms.repository;

import com.cloudcampus.cms.entity.AdmissionLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdmissionLeadRepository extends JpaRepository<AdmissionLead, UUID> {
    List<AdmissionLead> findByTenantIdOrderBySubmittedAtDesc(String tenantId);
    List<AdmissionLead> findByTenantIdAndStatusOrderBySubmittedAtDesc(String tenantId, String status);
}
