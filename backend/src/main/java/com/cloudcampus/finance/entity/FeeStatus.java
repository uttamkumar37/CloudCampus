package com.cloudcampus.finance.entity;

/**
 * Collection / payment status of a student fee record (invoice).
 */
public enum FeeStatus {
    PENDING,
    PARTIAL,
    PAID,
    WAIVED,
    OVERDUE
}
