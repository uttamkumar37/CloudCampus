package com.cloudcampus.parent.service;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.parent.dto.LinkParentRequest;
import com.cloudcampus.parent.dto.LinkedStudentResponse;
import com.cloudcampus.parent.entity.ParentStudent;
import com.cloudcampus.parent.repository.ParentStudentRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
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
        validateTenantContext();
        CloudCampusUserDetails user = requireUser();
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

    @Override
    @Transactional
    public void linkStudent(LinkParentRequest request) {
        validateTenantContext();
        if (parentStudentRepository.existsByParentUserIdAndStudentId(
                request.parentUserId(), request.studentId())) {
            throw new IllegalArgumentException("Link already exists");
        }
        if (!studentRepository.existsById(request.studentId())) {
            throw new IllegalArgumentException("Student not found: " + request.studentId());
        }
        ParentStudent link = new ParentStudent();
        link.setParentUserId(request.parentUserId());
        link.setStudentId(request.studentId());
        parentStudentRepository.save(link);
    }

    @Override
    @Transactional
    public void unlinkStudent(UUID linkId) {
        validateTenantContext();
        if (!parentStudentRepository.existsById(linkId)) {
            throw new IllegalArgumentException("Link not found: " + linkId);
        }
        parentStudentRepository.deleteById(linkId);
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required");
        }
    }

    private CloudCampusUserDetails requireUser() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof CloudCampusUserDetails c)) {
            throw new IllegalStateException("Unexpected principal");
        }
        return c;
    }
}
