package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.UUID;

/**
 * A School belongs to a Tenant and is the primary scope boundary for all domain
 * data: Students, Classes, Attendance, Fees, Timetable, etc.
 *
 * Design decisions:
 *
 * 1. Every domain entity must carry BOTH tenantId AND schoolId.
 *    tenantId alone is insufficient for multi-school tenants (groups of schools
 *    under one subscription — e.g. "ABC Educational Trust").
 *
 * 2. `code` is unique within a tenant (enforced by DB unique constraint on
 *    (tenant_id, code)). It is short and human-readable — e.g. "MAIN", "NORTH",
 *    "BRANCH_01". Used in URLs and reports.
 *
 * 3. When a tenant is created, TenantServiceImpl auto-creates one default School
 *    (code = "MAIN", name = tenant name). This keeps the data model consistent
 *    for single-school tenants without special-casing at the query layer.
 *
 * 4. Soft delete is NOT applied here — school decommissioning is handled by the
 *    INACTIVE status. Physical delete is never allowed (referential integrity).
 *
 * Maps to the `schools` table created in V6__create_schools.sql.
 */
@Entity
@Table(
        name = "schools",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_schools_tenant_code",
                columnNames = {"tenant_id", "code"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class School {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    // Short human-readable identifier, unique per tenant. e.g. "MAIN", "NORTH".
    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SchoolStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected School() {}

    /**
     * Full constructor for programmatic creation (e.g. in TenantServiceImpl).
     */
    public School(UUID id, UUID tenantId, String name, String code, SchoolStatus status, Instant createdAt) {
        this.id        = id;
        this.tenantId  = tenantId;
        this.name      = name;
        this.code      = code;
        this.status    = status;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID         getId()       { return id; }
    public UUID         getTenantId() { return tenantId; }
    public String       getName()     { return name; }
    public String       getCode()     { return code; }
    public String       getAddress()  { return address; }
    public String       getPhone()    { return phone; }
    public String       getEmail()    { return email; }
    public String       getLogoUrl()  { return logoUrl; }
    public SchoolStatus getStatus()   { return status; }
    public Instant      getCreatedAt(){ return createdAt; }
    public Instant      getUpdatedAt(){ return updatedAt; }

    // ── Mutators (restricted — keep updates intentional) ──────────────────────

    public void setName(String name)        { this.name    = name; }
    public void setAddress(String address)  { this.address = address; }
    public void setPhone(String phone)      { this.phone   = phone; }
    public void setEmail(String email)      { this.email   = email; }
    public void setLogoUrl(String logoUrl)  { this.logoUrl = logoUrl; }
    public void setStatus(SchoolStatus s)   { this.status  = s; }
}
