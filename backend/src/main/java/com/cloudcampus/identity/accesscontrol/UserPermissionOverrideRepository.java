package com.cloudcampus.identity.accesscontrol;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPermissionOverrideRepository extends JpaRepository<UserPermissionOverride, String> {

    List<UserPermissionOverride> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("""
            select permissionOverride
            from UserPermissionOverride permissionOverride
            join fetch permissionOverride.permission permission
            where permissionOverride.user.id = :userId
            order by permissionOverride.createdAt desc
            """)
    List<UserPermissionOverride> findByUserIdWithPermissionOrderByCreatedAtDesc(@Param("userId") String userId);

    List<UserPermissionOverride> findByUserIdAndPermissionCodeAndActiveTrue(String userId, String permissionCode);

    List<UserPermissionOverride> findByUserIdIn(Collection<String> userIds);
}
