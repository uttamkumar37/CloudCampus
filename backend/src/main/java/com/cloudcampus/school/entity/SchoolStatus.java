package com.cloudcampus.school.entity;

/**
 * Lifecycle status of a School.
 *
 * ACTIVE   — school is operational; students/staff can log in.
 * INACTIVE — school has been decommissioned or paused; access should be denied.
 */
public enum SchoolStatus {
    ACTIVE,
    INACTIVE
}
