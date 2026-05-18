package com.cloudcampus.onlineclass.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.onlineclass.dto.OnlineClassRequest;
import com.cloudcampus.onlineclass.dto.OnlineClassResponse;
import com.cloudcampus.onlineclass.entity.OnlineClass;
import com.cloudcampus.onlineclass.repository.OnlineClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class OnlineClassServiceImpl implements OnlineClassService {

    private final OnlineClassRepository repository;

    public OnlineClassServiceImpl(OnlineClassRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public OnlineClassResponse schedule(UUID tenantId, UUID schoolId, UUID staffId, OnlineClassRequest req) {
        OnlineClass oc = OnlineClass.create(
                tenantId, schoolId, staffId,
                req.classId(), req.sectionId(), req.subjectId(),
                req.title(), req.description(), req.meetingUrl(),
                req.platform(), req.scheduledAt(),
                req.durationMinutes() > 0 ? req.durationMinutes() : 60
        );
        return OnlineClassResponse.from(repository.save(oc));
    }

    @Override
    @Transactional
    public OnlineClassResponse updateStatus(UUID tenantId, UUID classId, String action) {
        OnlineClass oc = findOwned(tenantId, classId);
        switch (action.toLowerCase()) {
            case "start"  -> oc.start();
            case "end"    -> oc.end();
            case "cancel" -> oc.cancel();
            default -> throw new BadRequestException("Unknown action: " + action + ". Use start|end|cancel");
        }
        return OnlineClassResponse.from(repository.save(oc));
    }

    @Override
    @Transactional
    public OnlineClassResponse addRecording(UUID tenantId, UUID classId, String recordingUrl) {
        OnlineClass oc = findOwned(tenantId, classId);
        oc.setRecordingUrl(recordingUrl);
        return OnlineClassResponse.from(repository.save(oc));
    }

    @Override
    @Transactional
    public void delete(UUID tenantId, UUID classId) {
        repository.delete(findOwned(tenantId, classId));
    }

    @Override
    public List<OnlineClassResponse> listBySchool(UUID schoolId, Instant from, Instant to) {
        return repository.findBySchoolIdAndScheduledAtBetweenOrderByScheduledAtAsc(schoolId, from, to)
                .stream().map(OnlineClassResponse::from).toList();
    }

    @Override
    public List<OnlineClassResponse> listByStaff(UUID staffId, Instant from, Instant to) {
        return repository.findByStaffIdAndScheduledAtBetweenOrderByScheduledAtAsc(staffId, from, to)
                .stream().map(OnlineClassResponse::from).toList();
    }

    @Override
    public List<OnlineClassResponse> listBySection(UUID sectionId, Instant from, Instant to) {
        return repository.findBySectionIdAndScheduledAtBetweenOrderByScheduledAtAsc(sectionId, from, to)
                .stream().map(OnlineClassResponse::from).toList();
    }

    private OnlineClass findOwned(UUID tenantId, UUID classId) {
        return repository.findByIdAndTenantId(classId, tenantId)
                .orElseThrow(() -> new NotFoundException("Online class not found"));
    }
}
