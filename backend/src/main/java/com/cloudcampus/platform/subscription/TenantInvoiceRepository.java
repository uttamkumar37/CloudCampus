package com.cloudcampus.platform.subscription;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TenantInvoiceRepository extends JpaRepository<TenantInvoice, String>, JpaSpecificationExecutor<TenantInvoice> {

    long countByTenantId(String tenantId);

    List<TenantInvoice> findByTenantIdOrderByIssuedAtDesc(String tenantId);

    List<TenantInvoice> findAllByOrderByIssuedAtDesc();

    long countByStatus(TenantInvoiceStatus status);
}
