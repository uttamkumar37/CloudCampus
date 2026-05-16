package com.cloudcampus.subscription.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.subscription.dto.AssignPlanRequest;
import com.cloudcampus.subscription.dto.SubscriptionPlanResponse;
import com.cloudcampus.subscription.dto.TenantSubscriptionResponse;
import com.cloudcampus.subscription.entity.SubscriptionPlanCode;
import com.cloudcampus.subscription.entity.TenantSubscription;
import com.cloudcampus.subscription.repository.TenantSubscriptionRepository;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.tenant.service.TenantConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);

    private final TenantSubscriptionRepository subRepo;
    private final TenantRepository             tenantRepo;
    private final TenantConfigService          configService;

    SubscriptionServiceImpl(TenantSubscriptionRepository subRepo,
                            TenantRepository             tenantRepo,
                            TenantConfigService          configService) {
        this.subRepo       = subRepo;
        this.tenantRepo    = tenantRepo;
        this.configService = configService;
    }

    @Override
    public List<SubscriptionPlanResponse> listPlans() {
        return Arrays.stream(SubscriptionPlanCode.values())
                .map(SubscriptionPlanResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TenantSubscriptionResponse getSubscription(UUID tenantId) {
        return subRepo.findByTenantId(tenantId)
                .map(TenantSubscriptionResponse::from)
                .orElse(TenantSubscriptionResponse.defaultFree(tenantId));
    }

    @Override
    @Transactional
    public TenantSubscriptionResponse assignPlan(UUID tenantId, AssignPlanRequest request,
                                                 UUID assignedByUserId) {
        if (!tenantRepo.existsById(tenantId)) {
            throw new NotFoundException("Tenant not found: " + tenantId);
        }

        TenantSubscription sub = subRepo.findByTenantId(tenantId)
                .orElse(null);

        if (sub == null) {
            sub = TenantSubscription.create(tenantId, request.planCode(),
                    request.billingCycle(), assignedByUserId, request.notes());
        } else {
            sub.reassign(request.planCode(), request.billingCycle(),
                    assignedByUserId, request.notes());
        }
        subRepo.save(sub);

        // Push plan limits into tenant_configs so UsageLimitEnforcer picks them up immediately.
        SubscriptionPlanCode plan = request.planCode();
        configService.set(tenantId, TenantConfigKey.MAX_STUDENTS_PER_SCHOOL,
                String.valueOf(plan.getMaxStudentsPerSchool()));
        configService.set(tenantId, TenantConfigKey.MAX_STAFF_PER_SCHOOL,
                String.valueOf(plan.getMaxStaffPerSchool()));
        configService.set(tenantId, TenantConfigKey.MAX_SCHOOLS,
                String.valueOf(plan.getMaxSchools()));

        log.info("Subscription assigned: tenant={} plan={} billing={} by={}",
                tenantId, plan, request.billingCycle(), assignedByUserId);

        return TenantSubscriptionResponse.from(sub);
    }
}
