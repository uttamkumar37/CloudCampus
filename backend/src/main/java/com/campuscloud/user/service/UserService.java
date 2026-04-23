package com.campuscloud.user.service;

import com.campuscloud.user.dto.UserCreateRequest;
import com.campuscloud.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    Page<UserResponse> getUsers(Pageable pageable);
}
