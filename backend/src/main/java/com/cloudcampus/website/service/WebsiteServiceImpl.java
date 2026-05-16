package com.cloudcampus.website.service;

import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.website.dto.*;
import com.cloudcampus.website.entity.*;
import com.cloudcampus.website.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WebsiteServiceImpl implements WebsiteService {

    private final WebsiteRepository        websiteRepo;
    private final WebsitePageRepository    pageRepo;
    private final WebsiteSectionRepository sectionRepo;
    private final WebsiteNavItemRepository navRepo;

    public WebsiteServiceImpl(WebsiteRepository websiteRepo,
                               WebsitePageRepository pageRepo,
                               WebsiteSectionRepository sectionRepo,
                               WebsiteNavItemRepository navRepo) {
        this.websiteRepo = websiteRepo;
        this.pageRepo    = pageRepo;
        this.sectionRepo = sectionRepo;
        this.navRepo     = navRepo;
    }

    // ── Website root ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public WebsiteResponse getOrCreateWebsite(UUID tenantId, UUID schoolId) {
        return websiteRepo.findBySchoolId(schoolId)
                .map(WebsiteResponse::from)
                .orElseGet(() -> {
                    Website w = websiteRepo.save(Website.create(tenantId, schoolId));
                    return WebsiteResponse.from(w);
                });
    }

    @Override
    @Transactional
    public WebsiteResponse setPublished(UUID schoolId, boolean published) {
        Website w = websiteRepo.findBySchoolId(schoolId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
        w.setPublished(published);
        return WebsiteResponse.from(websiteRepo.save(w));
    }

    // ── Pages ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PageResponse> listPages(UUID schoolId) {
        return pageRepo.findBySchoolIdOrderByDisplayOrderAsc(schoolId)
                .stream().map(PageResponse::from).toList();
    }

    @Override
    @Transactional
    public PageResponse createPage(UUID tenantId, UUID schoolId, PageRequest req) {
        if (pageRepo.existsBySchoolIdAndSlug(schoolId, req.slug())) {
            throw new ConflictException("A page with slug '" + req.slug() + "' already exists");
        }
        WebsitePage p = pageRepo.save(
                WebsitePage.create(tenantId, schoolId, req.title(), req.slug(), req.displayOrder()));
        applyPageFields(p, req);
        return PageResponse.from(pageRepo.save(p));
    }

    @Override
    @Transactional
    public PageResponse updatePage(UUID pageId, UUID schoolId, PageRequest req) {
        WebsitePage p = requirePage(pageId, schoolId);
        if (!p.getSlug().equals(req.slug()) && pageRepo.existsBySchoolIdAndSlug(schoolId, req.slug())) {
            throw new ConflictException("A page with slug '" + req.slug() + "' already exists");
        }
        applyPageFields(p, req);
        return PageResponse.from(pageRepo.save(p));
    }

    @Override
    @Transactional
    public void deletePage(UUID pageId, UUID schoolId) {
        WebsitePage p = requirePage(pageId, schoolId);
        sectionRepo.deleteByPageId(pageId);
        pageRepo.delete(p);
    }

    // ── Sections ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponse> listSections(UUID pageId, UUID schoolId) {
        requirePage(pageId, schoolId);
        return sectionRepo.findByPageIdOrderByPositionAsc(pageId)
                .stream().map(SectionResponse::from).toList();
    }

    @Override
    @Transactional
    public SectionResponse addSection(UUID tenantId, UUID pageId, UUID schoolId, SectionRequest req) {
        requirePage(pageId, schoolId);
        WebsiteSection s = WebsiteSection.create(
                tenantId, pageId, req.sectionType(), req.position(), req.content());
        s.setVisible(req.visible());
        return SectionResponse.from(sectionRepo.save(s));
    }

    @Override
    @Transactional
    public SectionResponse updateSection(UUID sectionId, UUID pageId, UUID schoolId, SectionRequest req) {
        requirePage(pageId, schoolId);
        WebsiteSection s = sectionRepo.findByIdAndPageId(sectionId, pageId)
                .orElseThrow(() -> new NotFoundException("Section not found"));
        s.setSectionType(req.sectionType());
        s.setPosition(req.position());
        s.setContent(req.content());
        s.setVisible(req.visible());
        return SectionResponse.from(sectionRepo.save(s));
    }

    @Override
    @Transactional
    public void deleteSection(UUID sectionId, UUID pageId, UUID schoolId) {
        requirePage(pageId, schoolId);
        WebsiteSection s = sectionRepo.findByIdAndPageId(sectionId, pageId)
                .orElseThrow(() -> new NotFoundException("Section not found"));
        sectionRepo.delete(s);
    }

    // ── Nav ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<NavItemResponse> listNav(UUID schoolId) {
        return navRepo.findBySchoolIdOrderByPositionAsc(schoolId)
                .stream().map(NavItemResponse::from).toList();
    }

    @Override
    @Transactional
    public NavItemResponse addNavItem(UUID tenantId, UUID schoolId, NavItemRequest req) {
        WebsiteNavItem n = WebsiteNavItem.create(
                tenantId, schoolId, req.label(), req.url(), req.pageId(), req.position(), req.parentId());
        return NavItemResponse.from(navRepo.save(n));
    }

    @Override
    @Transactional
    public NavItemResponse updateNavItem(UUID itemId, UUID schoolId, NavItemRequest req) {
        WebsiteNavItem n = navRepo.findByIdAndSchoolId(itemId, schoolId)
                .orElseThrow(() -> new NotFoundException("Nav item not found"));
        n.setLabel(req.label());
        n.setUrl(req.url());
        n.setPageId(req.pageId());
        n.setPosition(req.position());
        n.setParentId(req.parentId());
        return NavItemResponse.from(navRepo.save(n));
    }

    @Override
    @Transactional
    public void deleteNavItem(UUID itemId, UUID schoolId) {
        WebsiteNavItem n = navRepo.findByIdAndSchoolId(itemId, schoolId)
                .orElseThrow(() -> new NotFoundException("Nav item not found"));
        navRepo.delete(n);
    }

    // ── Public ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PublicSiteResponse getPublicSite(UUID schoolId, String schoolName, String tenantCode) {
        List<PageResponse>    pages = pageRepo
                .findBySchoolIdAndPublishedTrueOrderByDisplayOrderAsc(schoolId)
                .stream().map(PageResponse::from).toList();
        List<NavItemResponse> nav   = listNav(schoolId);
        return new PublicSiteResponse(schoolName, tenantCode, pages, nav);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPublicPage(UUID schoolId, String slug) {
        return pageRepo.findBySchoolIdAndSlug(schoolId, slug)
                .filter(WebsitePage::isPublished)
                .map(PageResponse::from)
                .orElseThrow(() -> new NotFoundException("Page not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponse> getPublicSections(UUID pageId) {
        return sectionRepo.findByPageIdAndVisibleTrueOrderByPositionAsc(pageId)
                .stream().map(SectionResponse::from).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private WebsitePage requirePage(UUID pageId, UUID schoolId) {
        return pageRepo.findByIdAndSchoolId(pageId, schoolId)
                .orElseThrow(() -> new NotFoundException("Page not found"));
    }

    private void applyPageFields(WebsitePage p, PageRequest req) {
        p.setTitle(req.title());
        p.setSlug(req.slug());
        p.setSeoTitle(req.seoTitle());
        p.setSeoDescription(req.seoDescription());
        p.setPublished(req.published());
        p.setDisplayOrder(req.displayOrder());
    }
}
