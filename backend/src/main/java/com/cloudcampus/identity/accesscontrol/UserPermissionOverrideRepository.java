package com.cloudcampus.identity.accesscontrol;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPermissionOverrideRepository extends JpaRepository<UserPermissionOverride, String> {

    List<UserPermissionOverride> findByUserIdOrderByCreatedAtDesc(String userId);

    List<UserPermissionOverride> findByUserIdAndPermissionCodeAndActiveTrue(String userId, String permissionCode);

    List<UserPermissionOverride> findByUserIdIn(Collection<String> userIds);
}
