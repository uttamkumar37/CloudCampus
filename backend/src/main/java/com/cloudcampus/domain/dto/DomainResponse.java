package com.cloudcampus.domain.dto;

import com.cloudcampus.domain.entity.CustomDomain;
import com.cloudcampus.domain.entity.DomainStatus;

import java.time.Instant;
import java.util.UUID;

public record DomainResponse(
        UUID         id,
        UUID         tenantId,
        String       domain,
        String       verificationToken,
        String       dnsRecord,
        DomainStatus status,
        Instant      verifiedAt,
        Instant      lastCheckedAt,
        String       failureReason,
        Instant      createdAt
) {
    public static DomainResponse from(CustomDomain d) {
        String dnsRecord = "TXT _cloudcampus-verify." + d.getDomain() + " = " + d.getVerificationToken();
        return new DomainResponse(
                d.getId(), d.getTenantId(), d.getDomain(),
                d.getVerificationToken(), dnsRecord,
                d.getStatus(), d.getVerifiedAt(), d.getLastCheckedAt(),
                d.getFailureReason(), d.getCreatedAt()
        );
    }
}
