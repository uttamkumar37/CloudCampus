package com.campuscloud.homework.service;

import com.campuscloud.auth.security.CampusUserDetails;
import com.campuscloud.homework.dto.HomeworkCreateRequest;
import com.campuscloud.homework.dto.HomeworkResponse;
import com.campuscloud.homework.entity.HomeworkAssignment;
import com.campuscloud.homework.repository.HomeworkAssignmentRepository;
import com.campuscloud.tenant.service.TenantContext;
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
        CampusUserDetails user = currentUser();
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
            throw new IllegalArgumentException("X-Tenant-ID header is required");
        }
    }

    private CampusUserDetails currentUser() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof CampusUserDetails c)) {
            throw new IllegalStateException("Unexpected principal");
        }
        return c;
    }
}
