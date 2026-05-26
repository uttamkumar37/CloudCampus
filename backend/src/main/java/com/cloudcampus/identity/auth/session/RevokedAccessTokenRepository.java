package com.cloudcampus.identity.auth.session;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, String> {

    boolean existsByTokenHash(String tokenHash);
}
