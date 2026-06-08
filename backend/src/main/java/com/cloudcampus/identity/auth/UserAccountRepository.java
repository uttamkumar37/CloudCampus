package com.cloudcampus.identity.auth;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import com.cloudcampus.platform.superadmin.control.TenantAggregateCount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserAccountRepository extends JpaRepository<UserAccount, String>, JpaSpecificationExecutor<UserAccount> {

    Optional<UserAccount> findByTenantIdAndEmail(String tenantId, String email);

    List<UserAccount> findByEmailIgnoreCase(String email);

    long countByTenantIdAndRole(String tenantId, UserRole role);

    List<UserAccount> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    long countByStatus(UserStatus status);

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.TenantAggregateCount(
                account.tenant.id,
                count(account),
                coalesce(sum(case when account.status = com.cloudcampus.identity.auth.UserStatus.ACTIVE then 1 else 0 end), 0)
            )
            from UserAccount account
            where account.tenant.id in :tenantIds
            group by account.tenant.id
            """)
    List<TenantAggregateCount> countByTenantIds(@Param("tenantIds") Collection<String> tenantIds);
}
