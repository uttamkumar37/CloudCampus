package com.cloudcampus.website.service;

import com.cloudcampus.website.dto.*;

import java.util.List;
import java.util.UUID;

public interface WebsiteService {

    // ── Website root ──────────────────────────────────────────────────────────
    WebsiteResponse getOrCreateWebsite(UUID tenantId, UUID schoolId);
    WebsiteResponse setPublished(UUID schoolId, boolean published);

    // ── Pages ─────────────────────────────────────────────────────────────────
    List<PageResponse> listPages(UUID schoolId);
    PageResponse       createPage(UUID tenantId, UUID schoolId, PageRequest req);
    PageResponse       updatePage(UUID pageId, UUID schoolId, PageRequest req);
    void               deletePage(UUID pageId, UUID schoolId);

    // ── Sections ──────────────────────────────────────────────────────────────
    List<SectionResponse> listSections(UUID pageId, UUID schoolId);
    SectionResponse       addSection(UUID tenantId, UUID pageId, UUID schoolId, SectionRequest req);
    SectionResponse       updateSection(UUID sectionId, UUID pageId, UUID schoolId, SectionRequest req);
    void                  deleteSection(UUID sectionId, UUID pageId, UUID schoolId);

    // ── Nav ───────────────────────────────────────────────────────────────────
    List<NavItemResponse> listNav(UUID schoolId);
    NavItemResponse       addNavItem(UUID tenantId, UUID schoolId, NavItemRequest req);
    NavItemResponse       updateNavItem(UUID itemId, UUID schoolId, NavItemRequest req);
    void                  deleteNavItem(UUID itemId, UUID schoolId);

    // ── Public ────────────────────────────────────────────────────────────────
    PublicSiteResponse getPublicSite(UUID schoolId, String schoolName, String tenantCode);
    PageResponse       getPublicPage(UUID schoolId, String slug);
    List<SectionResponse> getPublicSections(UUID pageId);
}
