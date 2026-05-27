package com.cloudcampus.platform.subscription;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, String> {

    boolean existsByCode(String code);

    Optional<SubscriptionPlan> findByCode(String code);

    List<SubscriptionPlan> findAllByOrderByCodeAsc();
}
