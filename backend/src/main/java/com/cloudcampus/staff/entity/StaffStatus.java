package com.cloudcampus.staff.entity;

/**
 * Employment status lifecycle.
 *
 * Transitions:
 *   ACTIVE → ON_LEAVE    (approved leave — temporary)
 *   ON_LEAVE → ACTIVE    (return from leave)
 *   ACTIVE → RESIGNED    (voluntary exit)
 *   ACTIVE → TERMINATED  (involuntary exit)
 */
public enum StaffStatus {
    ACTIVE,
    ON_LEAVE,
    RESIGNED,
    TERMINATED
}
