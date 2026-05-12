package com.cloudcampus.whatsapp.repository;

import com.cloudcampus.whatsapp.entity.WhatsAppMessageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WhatsAppMessageLogRepository extends JpaRepository<WhatsAppMessageLog, UUID> {

    /** All logs for a school, newest first (paginated). */
    Page<WhatsAppMessageLog> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId, Pageable pageable);
}
