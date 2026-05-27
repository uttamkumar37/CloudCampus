package com.cloudcampus.people.parent;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ParentLeaveDecisionRequest(
        @NotNull
        ParentLeaveRequestStatus status,

        @Size(max = 1000)
        String adminNote
) {
}
