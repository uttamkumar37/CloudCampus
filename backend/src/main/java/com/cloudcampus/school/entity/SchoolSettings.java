package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.UUID;

/**
 * School-level operational configuration (1:1 with School).
 *
 * Created automatically when a school is onboarded. The school admin can
 * update these settings at any time without a restart.
 *
 * Key fields:
 * - timezone / locale       — used for display and report generation
 * - academicCalendarType    — controls how terms/semesters are structured
 * - workingDaysMask         — bitmask: bit0=Sun … bit6=Sat; Mon–Fri = 62
 * - gradingScheme           — marks representation in report cards
 * - minAttendancePct        — % below which a student is flagged ineligible
 * - maxClassCapacity        — default capacity for new sections
 * - allowLateAttendance     — if FALSE, attendance portal locks after cutoff
 * - lateCutoffMinutes       — minutes after class start considered "late"
 * - schoolLogoUrl           — CDN URL for school branding
 * - primaryColor            — hex colour for school-branded UI theme
 *
 * Maps to {@code school_settings} table (V16__create_school_settings.sql).
 */
@Entity
@Table(name = "school_settings")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class SchoolSettings {

    /** schoolId doubles as the PK — 1:1 with School. */
    @Id
    @Column(name = "school_id", updatable = false)
    private UUID schoolId;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "timezone", nullable = false, length = 60)
    private String timezone;

    @Column(name = "locale", nullable = false, length = 20)
    private String locale;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_calendar_type", nullable = false, length = 20)
    private AcademicCalendarType academicCalendarType;

    // Bitmask: bit0=Sunday … bit6=Saturday.  Mon–Fri = 0b0111110 = 62.
    @Column(name = "working_days_mask", nullable = false)
    private short workingDaysMask;

    @Enumerated(EnumType.STRING)
    @Column(name = "grading_scheme", nullable = false, length = 20)
    private GradingScheme gradingScheme;

    // Minimum attendance percentage; students below this are flagged.
    @Column(name = "min_attendance_pct", nullable = false)
    private short minAttendancePct;

    // Default maximum students per section; overridable per section.
    @Column(name = "max_class_capacity", nullable = false)
    private short maxClassCapacity;

    @Column(name = "allow_late_attendance", nullable = false)
    private boolean allowLateAttendance;

    // Minutes after class start that the portal considers "late" (0 = disabled).
    @Column(name = "late_cutoff_minutes", nullable = false)
    private short lateCutoffMinutes;

    @Column(name = "school_logo_url", length = 500)
    private String schoolLogoUrl;

    // CSS hex colour for school-branded UI theme, e.g. "#1A73E8".
    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SchoolSettings() {}

    @PrePersist
    void onPersist() {
        if (timezone             == null) timezone             = "UTC";
        if (locale               == null) locale               = "en";
        if (academicCalendarType == null) academicCalendarType = AcademicCalendarType.TERM;
        if (workingDaysMask      == 0)    workingDaysMask      = 62; // Mon–Fri
        if (gradingScheme        == null) gradingScheme        = GradingScheme.PERCENTAGE;
        if (minAttendancePct     == 0)    minAttendancePct     = 75;
        if (maxClassCapacity     == 0)    maxClassCapacity     = 40;
        if (lateCutoffMinutes    == 0)    lateCutoffMinutes    = 15;
        if (createdAt            == null) createdAt            = Instant.now();
        if (updatedAt            == null) updatedAt            = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID                 getSchoolId()            { return schoolId; }
    public UUID                 getTenantId()            { return tenantId; }
    public String               getTimezone()            { return timezone; }
    public String               getLocale()              { return locale; }
    public AcademicCalendarType getAcademicCalendarType(){ return academicCalendarType; }
    public short                getWorkingDaysMask()     { return workingDaysMask; }
    public GradingScheme        getGradingScheme()       { return gradingScheme; }
    public short                getMinAttendancePct()    { return minAttendancePct; }
    public short                getMaxClassCapacity()    { return maxClassCapacity; }
    public boolean              isAllowLateAttendance()  { return allowLateAttendance; }
    public short                getLateCutoffMinutes()   { return lateCutoffMinutes; }
    public String               getSchoolLogoUrl()       { return schoolLogoUrl; }
    public String               getPrimaryColor()        { return primaryColor; }
    public Instant              getCreatedAt()           { return createdAt; }
    public Instant              getUpdatedAt()           { return updatedAt; }

    // ── Mutators ──────────────────────────────────────────────────────────────

    public void setTimezone(String timezone)                           { this.timezone             = timezone; }
    public void setLocale(String locale)                               { this.locale               = locale; }
    public void setAcademicCalendarType(AcademicCalendarType t)        { this.academicCalendarType = t; }
    public void setWorkingDaysMask(short mask)                         { this.workingDaysMask      = mask; }
    public void setGradingScheme(GradingScheme scheme)                 { this.gradingScheme        = scheme; }
    public void setMinAttendancePct(short pct)                         { this.minAttendancePct     = pct; }
    public void setMaxClassCapacity(short capacity)                    { this.maxClassCapacity     = capacity; }
    public void setAllowLateAttendance(boolean allow)                  { this.allowLateAttendance  = allow; }
    public void setLateCutoffMinutes(short minutes)                    { this.lateCutoffMinutes    = minutes; }
    public void setSchoolLogoUrl(String url)                           { this.schoolLogoUrl        = url; }
    public void setPrimaryColor(String color)                          { this.primaryColor         = color; }

    // ── Factory ───────────────────────────────────────────────────────────────

    /** Creates a default SchoolSettings row for a newly onboarded school. */
    public static SchoolSettings createDefaults(UUID tenantId, UUID schoolId) {
        SchoolSettings s = new SchoolSettings();
        s.tenantId  = tenantId;
        s.schoolId  = schoolId;
        // All other fields are set by @PrePersist defaults.
        return s;
    }
}
