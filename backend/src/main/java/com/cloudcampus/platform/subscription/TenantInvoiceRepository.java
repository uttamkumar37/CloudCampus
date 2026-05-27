package com.cloudcampus.platform.subscription;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantInvoiceRepository extends JpaRepository<TenantInvoice, String> {

    long countByTenantId(String tenantId);

    List<TenantInvoice> findByTenantIdOrderByIssuedAtDesc(String tenantId);
}
