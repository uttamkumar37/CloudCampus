package com.cloudcampus.identity.auth.invitation;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, String> {

    Optional<Invitation> findByTokenHash(String tokenHash);
}
