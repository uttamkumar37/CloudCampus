package com.cloudcampus.storage;

import com.cloudcampus.common.exception.UsageLimitExceededException;
import com.cloudcampus.storage.dto.StorageQuotaResponse;
import com.cloudcampus.student.repository.StudentDocumentRepository;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class StorageQuotaService {

    private final TenantConfigRepository    configRepo;
    private final StudentDocumentRepository documentRepo;

    public StorageQuotaService(TenantConfigRepository configRepo,
                               StudentDocumentRepository documentRepo) {
        this.configRepo   = configRepo;
        this.documentRepo = documentRepo;
    }

    @Transactional(readOnly = true)
    public StorageQuotaResponse getUsage(UUID tenantId) {
        long used  = usedBytes(tenantId);
        long limit = quotaBytes(tenantId);
        return response(used, limit);
    }

    @Transactional(readOnly = true)
    public void checkUploadAllowed(UUID tenantId, long uploadBytes) {
        long limit = quotaBytes(tenantId);
        if (limit <= 0) {
            return;
        }

        long used = usedBytes(tenantId);
        long attempted = safeAdd(used, Math.max(uploadBytes, 0L));
        if (attempted > limit) {
            throw new UsageLimitExceededException(TenantConfigKey.MAX_STORAGE_BYTES.name(), attempted, limit);
        }
    }

    private long usedBytes(UUID tenantId) {
        return documentRepo.sumSizeBytesByTenantId(tenantId);
    }

    private long quotaBytes(UUID tenantId) {
        return configRepo.findByTenantIdAndConfigKey(tenantId, TenantConfigKey.MAX_STORAGE_BYTES)
                .map(c -> Long.parseLong(c.getConfigValue()))
                .orElse(Long.parseLong(TenantConfigKey.MAX_STORAGE_BYTES.getDefaultValue()));
    }

    private static StorageQuotaResponse response(long used, long limit) {
        long remaining = limit <= 0 ? 0 : Math.max(limit - used, 0);
        Integer pct = limit <= 0 ? null : (int) Math.min(100, (used * 100) / limit);
        return new StorageQuotaResponse(used, limit, remaining, pct);
    }

    private static long safeAdd(long a, long b) {
        long result = a + b;
        return result < 0 ? Long.MAX_VALUE : result;
    }
}
