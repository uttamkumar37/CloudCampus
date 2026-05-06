package com.cloudcampus.cms.service;

import com.cloudcampus.cms.dto.*;

import java.util.List;
import java.util.UUID;

public interface WebsiteCmsService {

    // --- Config ---
    WebsiteConfigResponse getConfig(String tenantId);
    WebsiteConfigResponse upsertConfig(String tenantId, WebsiteConfigRequest request);

    // --- Sections ---
    List<WebsiteSectionResponse> getSections(String tenantId);
    WebsiteSectionResponse upsertSection(String tenantId, WebsiteSectionRequest request);
    void deleteSection(String tenantId, String sectionKey);

    // --- Gallery ---
    List<GalleryItemResponse> getGallery(String tenantId);
    GalleryItemResponse addGalleryItem(String tenantId, GalleryItemRequest request);
    void deleteGalleryItem(String tenantId, UUID itemId);

    // --- Admission Leads ---
    AdmissionLeadResponse submitLead(String tenantSlug, AdmissionLeadRequest request);
    List<AdmissionLeadResponse> getLeads(String tenantId, String status);
    AdmissionLeadResponse updateLeadStatus(String tenantId, UUID leadId, String status, String notes);

    // --- Public ---
    PublicWebsiteResponse getPublicWebsite(String tenantSlug);
}
