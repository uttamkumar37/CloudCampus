package com.cloudcampus.identity.auth.session;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MfaChallengeRepository extends JpaRepository<MfaChallenge, String> {
}
