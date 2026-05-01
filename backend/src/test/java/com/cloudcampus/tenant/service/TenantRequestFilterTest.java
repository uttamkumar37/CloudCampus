package com.cloudcampus.tenant.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantRequestFilterTest {

    @Mock
    private TenantService tenantService;

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    @Test
    void resolvesTenantFromPrimarySlugHeader() throws ServletException, IOException {
        TenantRequestFilter filter = new TenantRequestFilter(tenantService);
        ReflectionTestUtils.setField(filter, "subdomainEnabled", false);
        ReflectionTestUtils.setField(filter, "tenantHeaderName", "X-Tenant-Slug");
        ReflectionTestUtils.setField(filter, "legacyTenantHeaderName", "X-Tenant-ID");

        when(tenantService.resolveSchemaByTenantIdentifier("greenwood")).thenReturn("school_greenwood");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Tenant-Slug", "GREENWOOD");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> assertThat(TenantContext.getTenant()).isEqualTo("school_greenwood");

        filter.doFilter(request, response, chain);

        verify(tenantService).resolveSchemaByTenantIdentifier("greenwood");
        assertThat(TenantContext.getTenant()).isEqualTo(TenantContext.DEFAULT_SCHEMA);
    }

    @Test
    void resolvesTenantFromLegacyHeaderWhenPrimaryMissing() throws ServletException, IOException {
        TenantRequestFilter filter = new TenantRequestFilter(tenantService);
        ReflectionTestUtils.setField(filter, "subdomainEnabled", false);
        ReflectionTestUtils.setField(filter, "tenantHeaderName", "X-Tenant-Slug");
        ReflectionTestUtils.setField(filter, "legacyTenantHeaderName", "X-Tenant-ID");

        when(tenantService.resolveSchemaByTenantIdentifier("sunrise")).thenReturn("school_sunrise");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Tenant-ID", "sunrise");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> assertThat(TenantContext.getTenant()).isEqualTo("school_sunrise");

        filter.doFilter(request, response, chain);

        verify(tenantService).resolveSchemaByTenantIdentifier("sunrise");
        assertThat(TenantContext.getTenant()).isEqualTo(TenantContext.DEFAULT_SCHEMA);
    }
}
