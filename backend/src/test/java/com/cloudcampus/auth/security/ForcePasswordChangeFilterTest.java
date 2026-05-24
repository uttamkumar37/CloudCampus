package com.cloudcampus.auth.security;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.web.RequestContext;
import jakarta.servlet.FilterChain;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForcePasswordChangeFilterTest {

    @Mock UserRepository userRepository;

    @AfterEach
    void tearDown() {
        RequestContext.clearAll();
    }

    @Test
    void blocksApplicationRequest_whenPasswordChangeIsRequired() throws Exception {
        UUID userId = UUID.randomUUID();
        RequestContext.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId, true)));

        ForcePasswordChangeFilter filter = new ForcePasswordChangeFilter(userRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/student/me");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        filter.doFilter(request, response, chain(chainCalled));

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("Password change required");
        assertThat(chainCalled).isFalse();
    }

    @Test
    void allowsChangePasswordEndpoint_whenPasswordChangeIsRequired() throws Exception {
        UUID userId = UUID.randomUUID();
        RequestContext.setUserId(userId);

        ForcePasswordChangeFilter filter = new ForcePasswordChangeFilter(userRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/v1/auth/change-password");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        filter.doFilter(request, response, chain(chainCalled));

        assertThat(chainCalled).isTrue();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void allowsApplicationRequest_whenPasswordChangeIsNotRequired() throws Exception {
        UUID userId = UUID.randomUUID();
        RequestContext.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId, false)));

        ForcePasswordChangeFilter filter = new ForcePasswordChangeFilter(userRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/student/me");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        filter.doFilter(request, response, chain(chainCalled));

        assertThat(chainCalled).isTrue();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    private static FilterChain chain(AtomicBoolean called) {
        return (request, response) -> called.set(true);
    }

    private static User user(UUID id, boolean forcePasswordChange) {
        return new User(id, UUID.randomUUID(), "student@example.com", "hash",
                UserRole.STUDENT, UserStatus.ACTIVE, forcePasswordChange, Instant.now());
    }
}
