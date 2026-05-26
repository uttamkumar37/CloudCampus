package com.cloudcampus.identity.auth.session;

import com.cloudcampus.identity.auth.UserAccount;

public record AuthenticatedUser(
        UserAccount user,
        String activeSchoolId
) {
}
