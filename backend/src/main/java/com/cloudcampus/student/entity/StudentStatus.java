package com.cloudcampus.student.entity;

/**
 * Student lifecycle status.
 *
 * Transitions:
 *   ACTIVE → GRADUATED      (end of final year)
 *   ACTIVE → TRANSFERRED    (student moves to another school)
 *   ACTIVE → SUSPENDED      (disciplinary — temporary)
 *   ACTIVE → WITHDRAWN      (family-initiated withdrawal)
 *   SUSPENDED → ACTIVE      (suspension lifted)
 */
public enum StudentStatus {
    ACTIVE,
    GRADUATED,
    TRANSFERRED,
    SUSPENDED,
    WITHDRAWN
}
