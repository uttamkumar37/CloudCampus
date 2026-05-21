package com.cloudcampus.storage.quarantine;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

@Component
public class UploadQuarantinePolicy {
    private static final long MAX_BYTES = 25L * 1024L * 1024L;
    private static final Set<String> ALLOWED_MIME_PREFIXES = Set.of("image/", "application/pdf");
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(".exe", ".bat", ".cmd", ".js", ".sh", ".jar", ".php");

    public UploadQuarantineDecision evaluate(String fileName, String contentType, long sizeBytes) {
        String normalizedName = fileName == null ? "" : fileName.toLowerCase(Locale.ROOT).trim();
        String normalizedType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
        if (normalizedName.isBlank()) {
            return UploadQuarantineDecision.quarantine("File name is required");
        }
        if (sizeBytes <= 0 || sizeBytes > MAX_BYTES) {
            return UploadQuarantineDecision.quarantine("File size is outside allowed bounds");
        }
        if (BLOCKED_EXTENSIONS.stream().anyMatch(normalizedName::endsWith)) {
            return UploadQuarantineDecision.quarantine("Executable or script uploads are blocked");
        }
        boolean allowedMime = ALLOWED_MIME_PREFIXES.stream().anyMatch(normalizedType::startsWith);
        if (!allowedMime) {
            return UploadQuarantineDecision.quarantine("Content type is not approved for direct storage");
        }
        return UploadQuarantineDecision.allow();
    }
}
