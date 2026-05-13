package com.cloudcampus.notice.service;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.notice.dto.NoticeCreateRequest;
import com.cloudcampus.notice.dto.NoticeResponse;
import com.cloudcampus.notice.entity.NoticeCategory;

import java.util.UUID;

public interface NoticeService {

    NoticeResponse create(UUID schoolId, NoticeCreateRequest req);

    PageResponse<NoticeResponse> list(UUID schoolId, NoticeCategory category,
                                      Boolean published, int page, int size);

    NoticeResponse getById(UUID schoolId, UUID noticeId);

    NoticeResponse publish(UUID schoolId, UUID noticeId);

    void delete(UUID schoolId, UUID noticeId);
}
