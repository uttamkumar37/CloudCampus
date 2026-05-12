package com.cloudcampus.staff.entity;

/**
 * Staff type — drives which profile tabs and features are exposed in the UI.
 *
 * TEACHER             — academic staff; get timetable, subject assignments.
 * PRINCIPAL           — school head; has school-admin-level privileges in the portal.
 * VICE_PRINCIPAL      — deputy head.
 * ACCOUNTANT          — finance staff; access to fee collection.
 * LIBRARIAN           — library management access.
 * LAB_ASSISTANT       — science / computer lab.
 * HOSTEL_WARDEN       — residential staff.
 * TRANSPORT_STAFF     — bus drivers / attendants.
 * ADMIN_STAFF         — office/clerical staff.
 * OTHER               — catch-all for miscellaneous roles.
 */
public enum StaffType {
    TEACHER,
    PRINCIPAL,
    VICE_PRINCIPAL,
    ACCOUNTANT,
    LIBRARIAN,
    LAB_ASSISTANT,
    HOSTEL_WARDEN,
    TRANSPORT_STAFF,
    ADMIN_STAFF,
    OTHER
}
