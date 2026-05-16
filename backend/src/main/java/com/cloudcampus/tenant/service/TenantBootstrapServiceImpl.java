package com.cloudcampus.tenant.service;

import com.cloudcampus.finance.entity.FeeCategory;
import com.cloudcampus.finance.repository.FeeCategoryRepository;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.Department;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.DepartmentRepository;
import com.cloudcampus.website.entity.Website;
import com.cloudcampus.website.entity.WebsitePage;
import com.cloudcampus.website.entity.WebsiteSection;
import com.cloudcampus.website.repository.WebsitePageRepository;
import com.cloudcampus.website.repository.WebsiteRepository;
import com.cloudcampus.website.repository.WebsiteSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Populates a brand-new tenant school with sensible defaults so the admin can
 * start entering data immediately without manual setup (CC-0211).
 *
 * Seeded data:
 *   • 1 current academic year (April–March, Indian academic calendar)
 *   • 5 departments  — Academic, Science, Arts & Humanities, Administration, Sports
 *   • 4 fee categories — Tuition Fee, Examination Fee, Library Fee, Sports Fee
 *
 * All inserts are guarded by exists-checks so re-bootstrapping is idempotent.
 */
@Service
public class TenantBootstrapServiceImpl implements TenantBootstrapService {

    private static final List<String[]> DEFAULT_DEPARTMENTS = List.of(
            new String[]{"Academic",         "ACAD", "General academic activities"},
            new String[]{"Science",          "SCI",  "Science and laboratory subjects"},
            new String[]{"Arts & Humanities","ARTS",  "Languages, social studies, and arts"},
            new String[]{"Administration",   "ADMIN", "Administrative and support staff"},
            new String[]{"Sports",           "SPT",  "Physical education and sports"}
    );

    private static final List<String[]> DEFAULT_FEE_CATEGORIES = List.of(
            new String[]{"Tuition Fee",      "Core academic instruction fee"},
            new String[]{"Examination Fee",  "Fee for term and annual examinations"},
            new String[]{"Library Fee",      "Library access and resource maintenance"},
            new String[]{"Sports Fee",       "Sports equipment, ground maintenance, and PE"}
    );

    private final AcademicYearRepository    academicYearRepository;
    private final DepartmentRepository      departmentRepository;
    private final FeeCategoryRepository     feeCategoryRepository;
    private final WebsiteRepository         websiteRepository;
    private final WebsitePageRepository     websitePageRepository;
    private final WebsiteSectionRepository  websiteSectionRepository;

    public TenantBootstrapServiceImpl(AcademicYearRepository academicYearRepository,
                                      DepartmentRepository departmentRepository,
                                      FeeCategoryRepository feeCategoryRepository,
                                      WebsiteRepository websiteRepository,
                                      WebsitePageRepository websitePageRepository,
                                      WebsiteSectionRepository websiteSectionRepository) {
        this.academicYearRepository   = academicYearRepository;
        this.departmentRepository     = departmentRepository;
        this.feeCategoryRepository    = feeCategoryRepository;
        this.websiteRepository        = websiteRepository;
        this.websitePageRepository    = websitePageRepository;
        this.websiteSectionRepository = websiteSectionRepository;
    }

    @Override
    @Transactional
    public void bootstrap(UUID tenantId, UUID schoolId) {
        seedAcademicYear(tenantId, schoolId);
        seedDepartments(tenantId, schoolId);
        seedFeeCategories(tenantId, schoolId);
        seedWebsite(tenantId, schoolId);
    }

    // ── Academic Year ─────────────────────────────────────────────────────────

    private void seedAcademicYear(UUID tenantId, UUID schoolId) {
        // Indian academic calendar: April 1 → March 31 of the following year.
        LocalDate today = LocalDate.now();
        int startYear   = today.getMonth().getValue() >= Month.APRIL.getValue()
                          ? today.getYear()
                          : today.getYear() - 1;
        int endYear     = startYear + 1;

        String label     = startYear + "-" + String.valueOf(endYear).substring(2);  // e.g. "2025-26"
        LocalDate start  = LocalDate.of(startYear, Month.APRIL, 1);
        LocalDate end    = LocalDate.of(endYear,   Month.MARCH, 31);

        if (!academicYearRepository.existsBySchoolIdAndName(schoolId, label)) {
            academicYearRepository.save(
                    AcademicYear.create(tenantId, schoolId, label, start, end, true));
        }
    }

    // ── Departments ───────────────────────────────────────────────────────────

    private void seedDepartments(UUID tenantId, UUID schoolId) {
        for (String[] row : DEFAULT_DEPARTMENTS) {
            String name = row[0];
            if (!departmentRepository.existsBySchoolIdAndName(schoolId, name)) {
                departmentRepository.save(
                        Department.create(tenantId, schoolId, name, row[1], row[2]));
            }
        }
    }

    // ── Fee Categories ────────────────────────────────────────────────────────

    private void seedFeeCategories(UUID tenantId, UUID schoolId) {
        for (String[] row : DEFAULT_FEE_CATEGORIES) {
            String name = row[0];
            if (!feeCategoryRepository.existsBySchoolIdAndName(schoolId, name)) {
                feeCategoryRepository.save(
                        FeeCategory.create(tenantId, schoolId, name, row[1]));
            }
        }
    }

    // ── Website ───────────────────────────────────────────────────────────────

    private void seedWebsite(UUID tenantId, UUID schoolId) {
        if (websiteRepository.existsBySchoolId(schoolId)) return;
        websiteRepository.save(Website.create(tenantId, schoolId));
        WebsitePage home = websitePageRepository.save(
                WebsitePage.create(tenantId, schoolId, "Home", "home", 0));
        websiteSectionRepository.save(WebsiteSection.create(
                tenantId, home.getId(), "HERO", 0,
                Map.of("headline", "Welcome", "subtext", "Powered by CloudCampus")));
    }
}
