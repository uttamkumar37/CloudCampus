package com.cloudcampus.staff.service;

import com.cloudcampus.staff.dto.CreateStaffRequest;
import com.cloudcampus.staff.dto.SchoolAdminMeResponse;
import com.cloudcampus.staff.dto.StaffResponse;
import com.cloudcampus.staff.dto.StaffSummaryResponse;
import com.cloudcampus.staff.dto.UpdateStaffRequest;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;

import java.util.List;
import java.util.UUID;

/**
 * Staff lifecycle and profile management (CC-0601 / CC-0602).
 */
public interface StaffService {

    /** Create a new staff record for a school. */
    StaffResponse create(UUID schoolId, CreateStaffRequest request);

    /** All staff in a school — all statuses (admin view). */
    List<StaffSummaryResponse> listBySchool(UUID schoolId);

    /** Staff filtered by status (most common: ACTIVE). */
    List<StaffSummaryResponse> listBySchoolAndStatus(UUID schoolId, StaffStatus status);

    /** Staff filtered by type (e.g. all TEACHER rows for timetabling). */
    List<StaffSummaryResponse> listBySchoolAndType(UUID schoolId, StaffType staffType);

    /** Staff assigned to a specific department. */
    List<StaffSummaryResponse> listByDepartment(UUID departmentId);

    /** Quick name-prefix search within a school. */
    List<StaffSummaryResponse> search(UUID schoolId, String query);

    /** Full staff profile (CC-0602). */
    StaffResponse getById(UUID id);

    /** Update profile / department details. */
    StaffResponse update(UUID id, UpdateStaffRequest request);

    /** Mark staff as on leave. */
    StaffResponse markOnLeave(UUID id);

    /** Return staff from leave to ACTIVE. */
    StaffResponse returnFromLeave(UUID id);

    /** Resign — voluntary exit. */
    StaffResponse resign(UUID id);

    /** Terminate — involuntary exit. */
    StaffResponse terminate(UUID id);

    /** Profile of the currently authenticated school-admin. */
    SchoolAdminMeResponse getMe();
}
