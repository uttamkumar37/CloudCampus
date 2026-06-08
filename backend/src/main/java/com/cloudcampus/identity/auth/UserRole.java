package com.cloudcampus.identity.auth;

public enum UserRole {
    SUPER_ADMIN,
    TENANT_ADMIN,
    SCHOOL_ADMIN,
    PRINCIPAL,
    TEACHER,
    STUDENT,
    PARENT,
    FINANCE_STAFF,
    OFFICE_STAFF,
    GUEST,
    SYSTEM,
    AI_AGENT,
    // Legacy alias kept for existing rows, seeded demo users, and older clients.
    STAFF,
}
