package com.campuscloud.parent.service;

import com.campuscloud.auth.security.CampusUserDetails;
import com.campuscloud.parent.dto.LinkedStudentResponse;
import com.campuscloud.parent.repository.ParentStudentRepository;
import com.campuscloud.student.entity.Student;
import com.campuscloud.student.repository.StudentRepository;
import com.campuscloud.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

    private final ParentStudentRepository parentStudentRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LinkedStudentResponse> myChildren() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-ID header is required");
        }
        CampusUserDetails user = requireUser();
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("Tenant user required");
        }
        UUID parentId = user.getUserId();
        List<LinkedStudentResponse> out = new ArrayList<>();
        for (var link : parentStudentRepository.findByParentUserId(parentId)) {
            Student s = studentRepository.findById(link.getStudentId()).orElse(null);
            if (s != null) {
                out.add(new LinkedStudentResponse(s.getId(), s.getAdmissionNo(), s.getFirstName(), s.getLastName()));
            }
        }
        return out;
    }

    private CampusUserDetails requireUser() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof CampusUserDetails c)) {
            throw new IllegalStateException("Unexpected principal");
        }
        return c;
    }
}
