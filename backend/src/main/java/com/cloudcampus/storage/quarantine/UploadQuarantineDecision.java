package com.cloudcampus.storage.quarantine;

public record UploadQuarantineDecision(boolean allowed, boolean quarantined, String reason) {
    public static UploadQuarantineDecision allow() {
        return new UploadQuarantineDecision(true, false, "Upload passed quarantine policy");
    }

    public static UploadQuarantineDecision quarantine(String reason) {
        return new UploadQuarantineDecision(false, true, reason);
    }
}
