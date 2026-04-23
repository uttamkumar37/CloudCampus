package com.campuscloud.auth.service;

import com.campuscloud.auth.dto.LoginRequest;
import com.campuscloud.auth.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
