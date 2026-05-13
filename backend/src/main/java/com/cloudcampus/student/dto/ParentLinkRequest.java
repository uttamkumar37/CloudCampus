package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Relationship;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to link a parent user to a student (CC-0506).
 *
 * The referenced user must exist and have role PARENT — validated by the service.
 */
public record ParentLinkRequest(

        @NotNull
        UUID parentUserId,

        @NotNull
        Relationship relationship,

        /** When true, clears the primary flag from any existing primary link first. */
        boolean makePrimary
) {}
