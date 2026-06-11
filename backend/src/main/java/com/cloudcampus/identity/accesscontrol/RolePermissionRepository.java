package com.cloudcampus.identity.accesscontrol;

import java.util.Collection;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RolePermissionRepository extends JpaRepository<RolePermission, String> {

    List<RolePermission> findByRoleOrderByPermissionCategoryAscPermissionCodeAsc(UserRole role);

    @Query("""
            select rolePermission
            from RolePermission rolePermission
            join fetch rolePermission.permission permission
            where rolePermission.role in :roles
            order by permission.category asc, permission.code asc
            """)
    List<RolePermission> findByRoleInWithPermission(@Param("roles") Collection<UserRole> roles);

    boolean existsByRoleInAndPermissionCode(Collection<UserRole> roles, String permissionCode);
}
