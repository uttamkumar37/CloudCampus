package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Relationship;
import com.cloudcampus.student.entity.StudentParentLink;

import java.time.Instant;
import java.util.UUID;

/** Response for a student-parent link (CC-0506). */
public record ParentLinkResponse(

        UUID         id,
        UUID         studentId,
        UUID         parentUserId,
        Relationship relationship,
        boolean      isPrimary,
        Instant      createdAt
) {
    public static ParentLinkResponse from(StudentParentLink link) {
        return new ParentLinkResponse(
                link.getId(),
                link.getStudentId(),
                link.getParentUserId(),
                link.getRelationship(),
                link.isPrimary(),
                link.getCreatedAt()
        );
    }
}
