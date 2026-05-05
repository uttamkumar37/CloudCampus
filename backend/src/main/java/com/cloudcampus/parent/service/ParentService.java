package com.cloudcampus.parent.service;

import com.cloudcampus.parent.dto.LinkParentRequest;
import com.cloudcampus.parent.dto.ParentStudentLinkResponse;
import com.cloudcampus.parent.dto.LinkedStudentResponse;

import java.util.List;
import java.util.UUID;

public interface ParentService {

    List<ParentStudentLinkResponse> getLinks();

    List<LinkedStudentResponse> myChildren();

    void linkStudent(LinkParentRequest request);

    void unlinkStudent(UUID linkId);
}
