package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.ParentLinkRequest;
import com.cloudcampus.student.dto.ParentLinkResponse;

import java.util.List;
import java.util.UUID;

/**
 * Parent-student mapping management (CC-0506).
 */
public interface ParentLinkService {

    /**
     * Link a parent user to a student.
     * Validates that the referenced user exists and has role PARENT.
     */
    ParentLinkResponse addLink(UUID studentId, ParentLinkRequest request);

    /** All parent links for a student (primary first). */
    List<ParentLinkResponse> listByStudent(UUID studentId);

    /** All student links for a parent user (parent portal "my children"). */
    List<ParentLinkResponse> listByParent(UUID parentUserId);

    /**
     * Remove a parent link.
     * Throws NotFoundException if the link does not exist.
     */
    void removeLink(UUID linkId);
}
