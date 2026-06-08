package com.cloudcampus.identity.accesscontrol;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, String> {

    Optional<Permission> findByCode(String code);

    List<Permission> findByActiveTrueOrderByCategoryAscCodeAsc();
}
