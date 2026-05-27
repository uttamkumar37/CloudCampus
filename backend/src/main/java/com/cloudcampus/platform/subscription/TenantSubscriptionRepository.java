package com.cloudcampus.platform.subscription;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, String> {

    List<TenantSubscription> findByPlanId(String planId);

    List<TenantSubscription> findAllByOrderByUpdatedAtDesc();
}
