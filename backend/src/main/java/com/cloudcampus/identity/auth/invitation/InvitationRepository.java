package com.cloudcampus.identity.auth.invitation;

import java.util.List;
import java.util.Optional;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, String> {

    Optional<Invitation> findByTokenHash(String tokenHash);

    List<Invitation> findBySchoolIdAndUserIdAndRoleOrderByCreatedAtDesc(String schoolId, String userId, UserRole role);
}
