package com.cloudcampus.student.profile.service;

import com.cloudcampus.student.profile.dto.StudentProfile360Response;
import com.cloudcampus.student.profile.dto.UpdateProfileSectionRequest;

import java.util.UUID;

public interface StudentProfile360Service {
    StudentProfile360Response getProfile(UUID studentId);
    StudentProfile360Response updateSection(UUID studentId, String sectionKey, UpdateProfileSectionRequest request);
}
