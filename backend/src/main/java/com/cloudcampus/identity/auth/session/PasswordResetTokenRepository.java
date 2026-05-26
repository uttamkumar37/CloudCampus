package com.cloudcampus.identity.auth.session;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
