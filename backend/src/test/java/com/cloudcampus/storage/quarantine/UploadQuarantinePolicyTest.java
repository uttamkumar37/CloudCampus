package com.cloudcampus.storage.quarantine;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UploadQuarantinePolicyTest {
    private final UploadQuarantinePolicy policy = new UploadQuarantinePolicy();

    @Test
    void allowsApprovedPdfUploads() {
        UploadQuarantineDecision decision = policy.evaluate("transfer-certificate.pdf", "application/pdf", 512_000);

        assertThat(decision.allowed()).isTrue();
        assertThat(decision.quarantined()).isFalse();
    }

    @Test
    void quarantinesExecutableUploads() {
        UploadQuarantineDecision decision = policy.evaluate("marksheet.exe", "application/octet-stream", 512_000);

        assertThat(decision.allowed()).isFalse();
        assertThat(decision.quarantined()).isTrue();
        assertThat(decision.reason()).contains("blocked");
    }
}
