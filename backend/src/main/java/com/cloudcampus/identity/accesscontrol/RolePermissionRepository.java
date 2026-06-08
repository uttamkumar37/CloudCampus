package com.cloudcampus.identity.accesscontrol;

import java.util.Collection;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, String> {

    List<RolePermission> findByRoleOrderByPermissionCategoryAscPermissionCodeAsc(UserRole role);

    boolean existsByRoleInAndPermissionCode(Collection<UserRole> roles, String permissionCode);
}
