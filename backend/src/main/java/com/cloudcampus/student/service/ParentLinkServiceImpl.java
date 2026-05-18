package com.cloudcampus.student.service;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.student.dto.ParentLinkRequest;
import com.cloudcampus.student.dto.ParentLinkResponse;
import com.cloudcampus.student.entity.StudentParentLink;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class ParentLinkServiceImpl implements ParentLinkService {

    private final StudentParentLinkRepository linkRepo;
    private final StudentRepository           studentRepo;
    private final UserRepository              userRepo;

    ParentLinkServiceImpl(StudentParentLinkRepository linkRepo,
                           StudentRepository studentRepo,
                           UserRepository userRepo) {
        this.linkRepo    = linkRepo;
        this.studentRepo = studentRepo;
        this.userRepo    = userRepo;
    }

    @Override
    @Transactional
    public ParentLinkResponse addLink(UUID studentId, ParentLinkRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        // Verify student exists.
        if (studentRepo.findByIdAndTenantId(studentId, tenantId).isEmpty()) {
            throw new NotFoundException("Student not found: " + studentId);
        }

        // Verify parent user exists and has PARENT role.
        User parent = userRepo.findByIdAndTenantId(req.parentUserId(), tenantId)
                .orElseThrow(() -> new NotFoundException("User not found: " + req.parentUserId()));
        if (parent.getRole() != UserRole.PARENT) {
            throw new BadRequestException(
                    "User " + req.parentUserId() + " does not have the PARENT role");
        }

        // Prevent duplicate links.
        if (linkRepo.existsByStudentIdAndParentUserId(studentId, req.parentUserId())) {
            throw new BadRequestException("Parent is already linked to this student");
        }

        // Clear existing primary if this link is to be the new primary.
        if (req.makePrimary()) {
            linkRepo.clearPrimaryForStudent(studentId);
        }

        StudentParentLink link = StudentParentLink.create(
                tenantId, studentId, req.parentUserId(), req.relationship(), req.makePrimary());

        return ParentLinkResponse.from(linkRepo.save(link));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParentLinkResponse> listByStudent(UUID studentId) {
        return linkRepo.findAllByStudentIdOrderByIsPrimaryDescCreatedAtAsc(studentId)
                       .stream().map(ParentLinkResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParentLinkResponse> listByParent(UUID parentUserId) {
        return linkRepo.findAllByParentUserIdOrderByCreatedAtAsc(parentUserId)
                       .stream().map(ParentLinkResponse::from).toList();
    }

    @Override
    @Transactional
    public void removeLink(UUID linkId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        StudentParentLink link = linkRepo.findByIdAndTenantId(linkId, tenantId)
                .orElseThrow(() -> new NotFoundException("Parent link not found: " + linkId));
        linkRepo.delete(link);
    }
}
