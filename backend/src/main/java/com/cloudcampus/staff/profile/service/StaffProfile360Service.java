package com.cloudcampus.staff.profile.service;

import com.cloudcampus.staff.profile.dto.StaffProfile360Response;

import java.util.UUID;

public interface StaffProfile360Service {
    StaffProfile360Response getProfile(UUID staffId);
}
