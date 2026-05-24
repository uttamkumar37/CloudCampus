package com.cloudcampus.notice.service;

import com.cloudcampus.audit.entity.AuditAction;
import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.notice.dto.NoticeCreateRequest;
import com.cloudcampus.notice.dto.NoticeResponse;
import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.entity.NoticeTarget;
import com.cloudcampus.notice.entity.SchoolNotice;
import com.cloudcampus.notice.repository.SchoolNoticeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
class NoticeServiceImpl implements NoticeService {

    private final SchoolNoticeRepository repo;
    private final AuditLogService auditLog;

    NoticeServiceImpl(SchoolNoticeRepository repo, AuditLogService auditLog) {
        this.repo = repo;
        this.auditLog = auditLog;
    }

    @Override
    @Transactional
    public NoticeResponse create(UUID schoolId, NoticeCreateRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID postedBy = RequestContext.getUserId();

        NoticeTarget target = req.target() != null ? req.target() : NoticeTarget.ALL;

        SchoolNotice notice = SchoolNotice.create(
                tenantId, schoolId,
                req.title(), req.content(),
                req.category(), target,
                req.priority(), req.expiresAt(),
                postedBy, req.publishImmediately());

        SchoolNotice saved = repo.save(notice);
        auditLog.logCriticalMutation(
                postedBy,
                tenantId,
                AuditAction.DATA_NOTICE_CREATED,
                "SchoolNotice",
                saved.getId().toString(),
                "Notice created",
                Map.of(
                        "schoolId", schoolId.toString(),
                        "published", String.valueOf(saved.isPublished())));
        return NoticeResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NoticeResponse> list(UUID schoolId, NoticeCategory category,
                                             Boolean published, int page, int size) {
        Page<SchoolNotice> p = repo.findFiltered(schoolId, category, published,
                PageRequest.of(page, size));
        return new PageResponse<>(
                p.getContent().stream().map(NoticeResponse::from).toList(),
                page * size, size, p.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public NoticeResponse getById(UUID schoolId, UUID noticeId) {
        return NoticeResponse.from(findOrThrow(schoolId, noticeId));
    }

    @Override
    @Transactional
    public NoticeResponse publish(UUID schoolId, UUID noticeId) {
        SchoolNotice notice = findOrThrow(schoolId, noticeId);
        if (notice.isPublished()) {
            throw new BadRequestException("Notice is already published");
        }
        notice.publish();
        SchoolNotice saved = repo.save(notice);
        auditLog.logCriticalMutation(
                RequestContext.getUserId(),
                currentTenantId(),
                AuditAction.DATA_NOTICE_PUBLISHED,
                "SchoolNotice",
                noticeId.toString(),
                "Notice published",
                Map.of("schoolId", schoolId.toString()));
        return NoticeResponse.from(saved);
    }

    @Override
    @Transactional
    public void delete(UUID schoolId, UUID noticeId) {
        SchoolNotice notice = findOrThrow(schoolId, noticeId);
        if (notice.isPublished()) {
            throw new BadRequestException("Published notices cannot be deleted");
        }
        repo.delete(notice);
        auditLog.logCriticalMutation(
                RequestContext.getUserId(),
                currentTenantId(),
                AuditAction.DATA_NOTICE_DELETED,
                "SchoolNotice",
                noticeId.toString(),
                "Notice deleted",
                Map.of("schoolId", schoolId.toString()));
    }

    private SchoolNotice findOrThrow(UUID schoolId, UUID noticeId) {
        return repo.findBySchoolIdAndId(schoolId, noticeId)
                .orElseThrow(() -> new NotFoundException("Notice not found: " + noticeId));
    }

    private UUID currentTenantId() {
        return UUID.fromString(RequestContext.getTenantId());
    }
}
