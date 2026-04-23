package com.campuscloud.academic.service;

import com.campuscloud.academic.dto.ClassCreateRequest;
import com.campuscloud.academic.dto.ClassResponse;
import com.campuscloud.academic.dto.SectionCreateRequest;
import com.campuscloud.academic.dto.SectionResponse;
import com.campuscloud.academic.dto.SubjectCreateRequest;
import com.campuscloud.academic.dto.SubjectResponse;

import java.util.List;

public interface AcademicService {

    ClassResponse createClass(ClassCreateRequest request);

    List<ClassResponse> getClasses();

    SubjectResponse createSubject(SubjectCreateRequest request);

    List<SubjectResponse> getSubjects();

    SectionResponse createSection(SectionCreateRequest request);

    List<SectionResponse> getSections();
}
