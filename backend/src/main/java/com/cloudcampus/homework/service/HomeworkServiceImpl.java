package com.cloudcampus.homework.service;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.repository.HomeworkAssignmentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeworkServiceImpl implements HomeworkService {

    private final HomeworkAssignmentRepository homeworkAssignmentRepository;

    @Override
    @Transactional
    public HomeworkResponse create(HomeworkCreateRequest request) {
        validateTenant();
        CloudCampusUserDetails user = currentUser();
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("Homework must be created by a tenant user account");
        }

        HomeworkAssignment hw = new HomeworkAssignment();
        hw.setTitle(request.title().trim());
        hw.setInstructions(request.instructions());
        hw.setClassId(request.classId());
        hw.setSectionId(request.sectionId());
        hw.setDueDate(request.dueDate());
        hw.setAssignedByUserId(user.getUserId());

        HomeworkAssignment saved = homeworkAssignmentRepository.save(hw);
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomeworkResponse> listForClass(UUID classId) {
        validateTenant();
        return homeworkAssignmentRepository.findByClassIdOrderByCreatedAtDesc(classId)
                .stream()
                .map(this::map)
                .toList();
    }

    private HomeworkResponse map(HomeworkAssignment h) {
        return new HomeworkResponse(
                h.getId(),
                h.getTitle(),
                h.getInstructions(),
                h.getClassId(),
                h.getSectionId(),
                h.getAssignedByUserId(),
                h.getDueDate(),
                h.getCreatedAt()
        );
    }

    private void validateTenant() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required");
        }
    }

    private CloudCampusUserDetails currentUser() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof CloudCampusUserDetails c)) {
            throw new IllegalStateException("Unexpected principal");
        }
        return c;
    }
}
