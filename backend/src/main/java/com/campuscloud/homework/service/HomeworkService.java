package com.campuscloud.homework.service;

import com.campuscloud.homework.dto.HomeworkCreateRequest;
import com.campuscloud.homework.dto.HomeworkResponse;

import java.util.List;
import java.util.UUID;

public interface HomeworkService {

    HomeworkResponse create(HomeworkCreateRequest request);

    List<HomeworkResponse> listForClass(UUID classId);
}
