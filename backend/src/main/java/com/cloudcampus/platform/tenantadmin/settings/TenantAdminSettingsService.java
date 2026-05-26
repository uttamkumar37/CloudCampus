package com.cloudcampus.platform.tenantadmin.settings;

import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.staff.StaffProfileRepository;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.subscription.TenantSchoolLimitRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantAdminSettingsService {

    private static final int DEFAULT_MAX_SCHOOLS = 1;
    private static final String SCAFFOLD_PLAN_CODE = "SCAFFOLD";

    private final TenantSettingsRepository tenantSettingsRepository;
    private final TenantRepository tenantRepository;
    private final TenantSchoolLimitRepository tenantSchoolLimitRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final StudentRepository studentRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final AuditLogService auditLogService;

    public TenantAdminSettingsService(
            TenantSettingsRepository tenantSettingsRepository,
            TenantRepository tenantRepository,
            TenantSchoolLimitRepository tenantSchoolLimitRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            StudentRepository studentRepository,
            StaffProfileRepository staffProfileRepository,
            AuditLogService auditLogService
    ) {
        this.tenantSettingsRepository = tenantSettingsRepository;
        this.tenantRepository = tenantRepository;
        this.tenantSchoolLimitRepository = tenantSchoolLimitRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.studentRepository = studentRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public TenantSettingsResponse settings(AuthenticatedUser authenticatedUser) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        Tenant tenant = tenant(actor);
        TenantSettings settings = tenantSettingsRepository.findById(tenant.getId())
                .orElseGet(() -> new TenantSettings(tenant));
        return toSettingsResponse(settings);
    }

    @Transactional
    public TenantSettingsResponse updateSettings(AuthenticatedUser authenticatedUser, TenantSettingsRequest request) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        Tenant tenant = tenant(actor);
        TenantSettings settings = tenantSettingsRepository.findById(tenant.getId())
                .orElseGet(() -> tenantSettingsRepository.save(new TenantSettings(tenant)));
        String oldDisplayName = settings.getDisplayName();
        settings.update(
                request.displayName(),
                request.billingEmail(),
                request.supportEmail(),
                request.timezone(),
                request.locale()
        );
        recordSettingsUpdated(actor, settings, oldDisplayName);
        return toSettingsResponse(settings);
    }

    @Transactional(readOnly = true)
    public TenantUsageResponse usage(AuthenticatedUser authenticatedUser) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        Tenant tenant = tenant(actor);
        int maxSchools = tenantSchoolLimitRepository.findById(tenant.getId())
                .map(limit -> limit.getMaxSchools())
                .orElse(DEFAULT_MAX_SCHOOLS);
        long schoolsUsed = schoolRepository.countByTenantId(tenant.getId());
        return new TenantUsageResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus().name(),
                SCAFFOLD_PLAN_CODE,
                maxSchools,
                schoolsUsed,
                schoolRepository.countByTenantIdAndActiveTrue(tenant.getId()),
                Math.max(maxSchools - schoolsUsed, 0),
                userAccountRepository.countByTenantIdAndRole(tenant.getId(), UserRole.SCHOOL_ADMIN),
                userAccountRepository.countByTenantIdAndRole(tenant.getId(), UserRole.TEACHER),
                staffProfileRepository.countByTenantId(tenant.getId()),
                studentRepository.countByTenantId(tenant.getId()),
                schoolsUsed >= maxSchools
        );
    }

    private UserAccount requireTenantAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.TENANT_ADMIN) {
            throw new ForbiddenException("Only TENANT_ADMIN can manage tenant settings.");
        }
        return actor;
    }

    private Tenant tenant(UserAccount actor) {
        return tenantRepository.findById(actor.getTenant().getId())
                .orElseThrow(() -> new ForbiddenException("Authenticated tenant is not available."));
    }

    private TenantSettingsResponse toSettingsResponse(TenantSettings settings) {
        Tenant tenant = settings.getTenant();
        return new TenantSettingsResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                settings.getDisplayName(),
                settings.getBillingEmail(),
                settings.getSupportEmail(),
                settings.getTimezone(),
                settings.getLocale(),
                settings.getUpdatedAt()
        );
    }

    private void recordSettingsUpdated(UserAccount actor, TenantSettings settings, String oldDisplayName) {
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TENANT_SETTINGS_UPDATED,
                "TenantSettings",
                actor.getTenant().getId(),
                "Tenant settings updated by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", actor.getTenant().getId(),
                        "oldDisplayName", oldDisplayName,
                        "newDisplayName", settings.getDisplayName(),
                        "billingEmail", maskEmail(settings.getBillingEmail()),
                        "supportEmail", maskEmail(settings.getSupportEmail()),
                        "timezone", settings.getTimezone(),
                        "locale", settings.getLocale()
                )
        );
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
