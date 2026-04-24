package com.campuscloud.parent.service;

import com.campuscloud.parent.dto.LinkedStudentResponse;

import java.util.List;

public interface ParentService {

    List<LinkedStudentResponse> myChildren();
}
