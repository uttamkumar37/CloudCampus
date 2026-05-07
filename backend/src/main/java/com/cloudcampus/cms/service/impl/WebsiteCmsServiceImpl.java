package com.cloudcampus.cms.service.impl;

import com.cloudcampus.cms.dto.*;
import com.cloudcampus.cms.entity.AdmissionLead;
import com.cloudcampus.cms.entity.WebsiteConfig;
import com.cloudcampus.cms.entity.WebsiteGalleryItem;
import com.cloudcampus.cms.entity.WebsiteSection;
import com.cloudcampus.cms.repository.AdmissionLeadRepository;
import com.cloudcampus.cms.repository.WebsiteConfigRepository;
import com.cloudcampus.cms.repository.WebsiteGalleryRepository;
import com.cloudcampus.cms.repository.WebsiteSectionRepository;
import com.cloudcampus.cms.service.WebsiteCmsService;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WebsiteCmsServiceImpl implements WebsiteCmsService {

    private final WebsiteConfigRepository configRepo;
    private final WebsiteSectionRepository sectionRepo;
    private final WebsiteGalleryRepository galleryRepo;
    private final AdmissionLeadRepository leadRepo;
    private final TenantRepository tenantRepo;

    // ---- Config ----

    @Override
    @Transactional(readOnly = true)
    public WebsiteConfigResponse getConfig(String tenantId) {
        WebsiteConfig config = configRepo.findByTenantId(tenantId)
                .orElseGet(() -> {
                    WebsiteConfig blank = new WebsiteConfig();
                    blank.setTenantId(tenantId);
                    return blank;
                });
        return toConfigResponse(config);
    }

    @Override
    @Transactional
    public WebsiteConfigResponse upsertConfig(String tenantId, WebsiteConfigRequest req) {
        WebsiteConfig config = configRepo.findByTenantId(tenantId).orElseGet(() -> {
            WebsiteConfig c = new WebsiteConfig();
            c.setTenantId(tenantId);
            return c;
        });
        config.setSchoolTagline(req.getSchoolTagline());
        config.setSchoolEmail(req.getSchoolEmail());
        config.setSchoolPhone(req.getSchoolPhone());
        config.setSchoolAddress(req.getSchoolAddress());
        config.setSchoolCity(req.getSchoolCity());
        config.setSchoolState(req.getSchoolState());
        config.setSchoolCountry(req.getSchoolCountry());
        config.setSchoolPincode(req.getSchoolPincode());
        config.setHeroImageUrl(req.getHeroImageUrl());
        config.setAboutText(req.getAboutText());
        config.setVisionText(req.getVisionText());
        config.setMissionText(req.getMissionText());
        config.setFacebookUrl(req.getFacebookUrl());
        config.setTwitterUrl(req.getTwitterUrl());
        config.setInstagramUrl(req.getInstagramUrl());
        config.setYoutubeUrl(req.getYoutubeUrl());
        config.setAdmissionsOpen(req.isAdmissionsOpen());
        config.setAdmissionInfo(req.getAdmissionInfo());
        config.setThemeColor(req.getThemeColor());
        config.setLogoUrl(req.getLogoUrl());
        config.setSchoolEstablishedYear(req.getSchoolEstablishedYear());
        config.setAffiliationBoard(req.getAffiliationBoard());
        config.setMediumOfInstruction(req.getMediumOfInstruction());
        config.setSchoolType(req.getSchoolType());
        config.setStudentCount(req.getStudentCount());
        config.setTeacherCount(req.getTeacherCount());
        config.setHeroCtaText(req.getHeroCtaText());
        config.setHeroCtaLink(req.getHeroCtaLink());
        config.setAchievementBadge(req.getAchievementBadge());
        config.setNoticesText(req.getNoticesText());
        return toConfigResponse(configRepo.save(config));
    }

    // ---- Sections ----

    @Override
    @Transactional(readOnly = true)
    public List<WebsiteSectionResponse> getSections(String tenantId) {
        return sectionRepo.findByTenantIdOrderByDisplayOrderAsc(tenantId)
                .stream().map(this::toSectionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WebsiteSectionResponse upsertSection(String tenantId, WebsiteSectionRequest req) {
        WebsiteSection section = sectionRepo.findByTenantIdAndSectionKey(tenantId, req.getSectionKey())
                .orElseGet(() -> {
                    WebsiteSection s = new WebsiteSection();
                    s.setTenantId(tenantId);
                    s.setSectionKey(req.getSectionKey());
                    return s;
                });
        section.setTitle(req.getTitle());
        section.setSubtitle(req.getSubtitle());
        section.setBodyJson(req.getBodyJson());
        section.setDisplayOrder(req.getDisplayOrder());
        section.setVisible(req.isVisible());
        return toSectionResponse(sectionRepo.save(section));
    }

    @Override
    @Transactional
    public void deleteSection(String tenantId, String sectionKey) {
        sectionRepo.findByTenantIdAndSectionKey(tenantId, sectionKey)
                .ifPresent(sectionRepo::delete);
    }

    // ---- Gallery ----

    @Override
    @Transactional(readOnly = true)
    public List<GalleryItemResponse> getGallery(String tenantId) {
        return galleryRepo.findByTenantIdOrderByDisplayOrderAsc(tenantId)
                .stream().map(this::toGalleryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GalleryItemResponse addGalleryItem(String tenantId, GalleryItemRequest req) {
        WebsiteGalleryItem item = new WebsiteGalleryItem();
        item.setTenantId(tenantId);
        item.setImageUrl(req.getImageUrl());
        item.setCaption(req.getCaption());
        item.setDisplayOrder(req.getDisplayOrder());
        item.setVisible(req.isVisible());
        return toGalleryResponse(galleryRepo.save(item));
    }

    @Override
    @Transactional
    public void deleteGalleryItem(String tenantId, UUID itemId) {
        galleryRepo.findById(itemId).ifPresent(item -> {
            if (item.getTenantId().equals(tenantId)) {
                galleryRepo.delete(item);
            }
        });
    }

    // ---- Admission Leads ----

    @Override
    @Transactional
    public AdmissionLeadResponse submitLead(String tenantSlug, AdmissionLeadRequest req) {
        Tenant tenant = tenantRepo.findBySlug(tenantSlug)
                .orElseThrow(() -> new IllegalArgumentException("School not found: " + tenantSlug));
        AdmissionLead lead = new AdmissionLead();
        lead.setTenantId(tenant.getTenantId());
        lead.setParentName(req.getParentName());
        lead.setParentEmail(req.getParentEmail());
        lead.setParentPhone(req.getParentPhone());
        lead.setStudentName(req.getStudentName());
        lead.setApplyingClass(req.getApplyingClass());
        lead.setMessage(req.getMessage());
        lead.setStatus("NEW");
        return toLeadResponse(leadRepo.save(lead));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdmissionLeadResponse> getLeads(String tenantId, String status) {
        List<AdmissionLead> leads = (status != null && !status.isBlank())
                ? leadRepo.findByTenantIdAndStatusOrderBySubmittedAtDesc(tenantId, status.toUpperCase())
                : leadRepo.findByTenantIdOrderBySubmittedAtDesc(tenantId);
        return leads.stream().map(this::toLeadResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdmissionLeadResponse updateLeadStatus(String tenantId, UUID leadId, String status, String notes) {
        AdmissionLead lead = leadRepo.findById(leadId)
                .filter(l -> l.getTenantId().equals(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));
        lead.setStatus(status.toUpperCase());
        if (notes != null) {
            lead.setNotes(notes);
        }
        return toLeadResponse(leadRepo.save(lead));
    }

    // ---- Public ----

    @Override
    @Transactional(readOnly = true)
    public PublicWebsiteResponse getPublicWebsite(String tenantSlug) {
        Tenant tenant = tenantRepo.findBySlug(tenantSlug)
                .filter(Tenant::isActive)
                .orElseThrow(() -> new IllegalArgumentException("School not found: " + tenantSlug));
        String tenantId = tenant.getTenantId();

        PublicWebsiteResponse response = new PublicWebsiteResponse();
        response.setTenantId(tenantId);
        response.setSchoolName(tenant.getSchoolName());
        response.setLogoUrl(tenant.getLogoUrl());
        response.setConfig(getConfig(tenantId));
        response.setSections(sectionRepo
                .findByTenantIdAndVisibleTrueOrderByDisplayOrderAsc(tenantId)
                .stream().map(this::toSectionResponse).collect(Collectors.toList()));
        response.setGallery(galleryRepo
                .findByTenantIdAndVisibleTrueOrderByDisplayOrderAsc(tenantId)
                .stream().map(this::toGalleryResponse).collect(Collectors.toList()));
        return response;
    }

    // ---- Mappers ----

    private WebsiteConfigResponse toConfigResponse(WebsiteConfig c) {
        WebsiteConfigResponse r = new WebsiteConfigResponse();
        r.setId(c.getId());
        r.setTenantId(c.getTenantId());
        r.setSchoolTagline(c.getSchoolTagline());
        r.setSchoolEmail(c.getSchoolEmail());
        r.setSchoolPhone(c.getSchoolPhone());
        r.setSchoolAddress(c.getSchoolAddress());
        r.setSchoolCity(c.getSchoolCity());
        r.setSchoolState(c.getSchoolState());
        r.setSchoolCountry(c.getSchoolCountry());
        r.setSchoolPincode(c.getSchoolPincode());
        r.setHeroImageUrl(c.getHeroImageUrl());
        r.setAboutText(c.getAboutText());
        r.setVisionText(c.getVisionText());
        r.setMissionText(c.getMissionText());
        r.setFacebookUrl(c.getFacebookUrl());
        r.setTwitterUrl(c.getTwitterUrl());
        r.setInstagramUrl(c.getInstagramUrl());
        r.setYoutubeUrl(c.getYoutubeUrl());
        r.setAdmissionsOpen(c.isAdmissionsOpen());
        r.setAdmissionInfo(c.getAdmissionInfo());
        r.setThemeColor(c.getThemeColor());
        r.setLogoUrl(c.getLogoUrl());
        r.setSchoolEstablishedYear(c.getSchoolEstablishedYear());
        r.setAffiliationBoard(c.getAffiliationBoard());
        r.setMediumOfInstruction(c.getMediumOfInstruction());
        r.setSchoolType(c.getSchoolType());
        r.setStudentCount(c.getStudentCount());
        r.setTeacherCount(c.getTeacherCount());
        r.setHeroCtaText(c.getHeroCtaText());
        r.setHeroCtaLink(c.getHeroCtaLink());
        r.setAchievementBadge(c.getAchievementBadge());
        r.setNoticesText(c.getNoticesText());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    private WebsiteSectionResponse toSectionResponse(WebsiteSection s) {
        WebsiteSectionResponse r = new WebsiteSectionResponse();
        r.setId(s.getId());
        r.setTenantId(s.getTenantId());
        r.setSectionKey(s.getSectionKey());
        r.setTitle(s.getTitle());
        r.setSubtitle(s.getSubtitle());
        r.setBodyJson(s.getBodyJson());
        r.setDisplayOrder(s.getDisplayOrder());
        r.setVisible(s.isVisible());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }

    private GalleryItemResponse toGalleryResponse(WebsiteGalleryItem g) {
        GalleryItemResponse r = new GalleryItemResponse();
        r.setId(g.getId());
        r.setTenantId(g.getTenantId());
        r.setImageUrl(g.getImageUrl());
        r.setCaption(g.getCaption());
        r.setDisplayOrder(g.getDisplayOrder());
        r.setVisible(g.isVisible());
        r.setCreatedAt(g.getCreatedAt());
        return r;
    }

    private AdmissionLeadResponse toLeadResponse(AdmissionLead l) {
        AdmissionLeadResponse r = new AdmissionLeadResponse();
        r.setId(l.getId());
        r.setTenantId(l.getTenantId());
        r.setParentName(l.getParentName());
        r.setParentEmail(l.getParentEmail());
        r.setParentPhone(l.getParentPhone());
        r.setStudentName(l.getStudentName());
        r.setApplyingClass(l.getApplyingClass());
        r.setMessage(l.getMessage());
        r.setStatus(l.getStatus());
        r.setSubmittedAt(l.getSubmittedAt());
        r.setNotes(l.getNotes());
        return r;
    }
}
