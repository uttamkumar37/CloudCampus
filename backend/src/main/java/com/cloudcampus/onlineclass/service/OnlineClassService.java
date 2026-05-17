package com.cloudcampus.onlineclass.service;

import com.cloudcampus.onlineclass.dto.OnlineClassRequest;
import com.cloudcampus.onlineclass.dto.OnlineClassResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OnlineClassService {
    OnlineClassResponse schedule(UUID tenantId, UUID schoolId, UUID staffId, OnlineClassRequest req);
    OnlineClassResponse updateStatus(UUID tenantId, UUID classId, String action);
    OnlineClassResponse addRecording(UUID tenantId, UUID classId, String recordingUrl);
    void delete(UUID tenantId, UUID classId);
    List<OnlineClassResponse> listBySchool(UUID schoolId, Instant from, Instant to);
    List<OnlineClassResponse> listByStaff(UUID staffId, Instant from, Instant to);
    List<OnlineClassResponse> listBySection(UUID sectionId, Instant from, Instant to);
}
