package com.campuscloud.auth.service;

import com.campuscloud.auth.dto.LoginRequest;
import com.campuscloud.auth.dto.LoginResponse;
import com.campuscloud.auth.dto.UserProfileResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserProfileResponse currentProfile();
}
