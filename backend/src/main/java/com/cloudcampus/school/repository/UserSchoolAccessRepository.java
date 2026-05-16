package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.UserSchoolAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSchoolAccessRepository extends JpaRepository<UserSchoolAccess, UUID> {

    List<UserSchoolAccess> findByUserIdOrderByPrimaryDescGrantedAtAsc(UUID userId);

    Optional<UserSchoolAccess> findByUserIdAndPrimaryTrue(UUID userId);

    Optional<UserSchoolAccess> findByUserIdAndSchoolId(UUID userId, UUID schoolId);

    boolean existsByUserIdAndSchoolId(UUID userId, UUID schoolId);

    List<UserSchoolAccess> findBySchoolId(UUID schoolId);

    @Modifying
    @Query("UPDATE UserSchoolAccess a SET a.primary = false WHERE a.userId = :userId")
    void clearPrimaryForUser(@Param("userId") UUID userId);
}
