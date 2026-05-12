package com.cloudcampus.school.entity;

public enum AcademicYearStatus {
    ACTIVE,    // year in progress — attendance/fees can be recorded
    CLOSED,    // year has ended — data is read-only
    ARCHIVED   // hidden from regular views; data retained for history
}
