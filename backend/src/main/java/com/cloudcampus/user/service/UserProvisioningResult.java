package com.cloudcampus.user.service;

import com.cloudcampus.user.entity.UserAccount;

public record UserProvisioningResult(
        UserAccount user,
        GeneratedCredentials credentials
) {
}
