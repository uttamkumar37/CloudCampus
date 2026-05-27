package com.cloudcampus.identity.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, String> {

    Optional<UserAccount> findByTenantIdAndEmail(String tenantId, String email);

    List<UserAccount> findByEmailIgnoreCase(String email);

    long countByTenantIdAndRole(String tenantId, UserRole role);

    List<UserAccount> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
