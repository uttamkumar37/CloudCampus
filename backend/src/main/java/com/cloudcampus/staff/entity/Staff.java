package com.cloudcampus.staff.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import com.cloudcampus.student.entity.Gender;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * School employee (teacher, accountant, librarian, …).
 *
 * Rules:
 * - employee_number is unique within (school_id) — auto-generated or provided.
 * - department_id is nullable; not all staff belong to an academic department.
 * - user_id is nullable — the login account is provisioned separately.
 * - staffType drives UI tabs and feature access; it is immutable after creation
 *   (changing a TEACHER to ACCOUNTANT requires a business workflow — deferred
 *   to a later phase).
 * - Gender re-uses the same {@link Gender} enum defined in the student package.
 *
 * Maps to {@code staff} table (V19__create_staff.sql).
 */
@Entity
@Table(
        name = "staff",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_staff_school_employee_number",
                columnNames = {"school_id", "employee_number"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Staff {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    /** Optional linked login account — provisioned separately. */
    @Column(name = "user_id")
    private UUID userId;

    /** Optional department assignment. */
    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "employee_number", nullable = false, length = 50)
    private String employeeNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "staff_type", nullable = false, length = 30)
    private StaffType staffType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StaffStatus status;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 30)
    private Gender gender;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "qualification", length = 300)
    private String qualification;

    @Column(name = "specialization", length = 300)
    private String specialization;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Staff() {}

    @PrePersist
    void onPersist() {
        if (id          == null) id          = UUID.randomUUID();
        if (status      == null) status      = StaffStatus.ACTIVE;
        if (joiningDate == null) joiningDate = LocalDate.now();
        if (createdAt   == null) createdAt   = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // -------------------------------------------------------------------------
    // Factory
    // -------------------------------------------------------------------------

    /**
     * Creates a new {@link Staff} record ready to be persisted.
     *
     * @param tenantId       owning tenant
     * @param schoolId       school the employee belongs to
     * @param employeeNumber unique number within the school (pre-generated)
     * @param staffType      role / type of the employee
     * @param firstName      given name
     * @param lastName       family name
     * @param joiningDate    date of joining (defaults to today if null)
     */
    public static Staff create(UUID tenantId, UUID schoolId,
                                String employeeNumber, StaffType staffType,
                                String firstName, String lastName,
                                LocalDate joiningDate) {
        Staff s = new Staff();
        s.tenantId       = tenantId;
        s.schoolId       = schoolId;
        s.employeeNumber = employeeNumber;
        s.staffType      = staffType;
        s.firstName      = firstName;
        s.lastName       = lastName;
        s.joiningDate    = joiningDate != null ? joiningDate : LocalDate.now();
        return s;
    }

    // -------------------------------------------------------------------------
    // Setters
    // -------------------------------------------------------------------------

    public void setUserId(UUID userId)               { this.userId         = userId; }
    public void setDepartmentId(UUID departmentId)   { this.departmentId   = departmentId; }
    public void setFirstName(String firstName)        { this.firstName      = firstName; }
    public void setLastName(String lastName)          { this.lastName       = lastName; }
    public void setDateOfBirth(LocalDate dob)         { this.dateOfBirth    = dob; }
    public void setGender(Gender gender)              { this.gender         = gender; }
    public void setPhone(String phone)                { this.phone          = phone; }
    public void setEmail(String email)                { this.email          = email; }
    public void setAddress(String address)            { this.address        = address; }
    public void setPhotoUrl(String photoUrl)          { this.photoUrl       = photoUrl; }
    public void setQualification(String q)            { this.qualification  = q; }
    public void setSpecialization(String s)           { this.specialization = s; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate    = joiningDate; }
    public void setStatus(StaffStatus status)         { this.status         = status; }
    public void setEmployeeNumber(String num)         { this.employeeNumber = num; }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public UUID        getId()             { return id; }
    public UUID        getTenantId()       { return tenantId; }
    public UUID        getSchoolId()       { return schoolId; }
    public UUID        getUserId()         { return userId; }
    public UUID        getDepartmentId()   { return departmentId; }
    public String      getEmployeeNumber() { return employeeNumber; }
    public StaffType   getStaffType()      { return staffType; }
    public StaffStatus getStatus()         { return status; }
    public String      getFirstName()      { return firstName; }
    public String      getLastName()       { return lastName; }
    public LocalDate   getDateOfBirth()    { return dateOfBirth; }
    public Gender      getGender()         { return gender; }
    public String      getPhone()          { return phone; }
    public String      getEmail()          { return email; }
    public String      getAddress()        { return address; }
    public String      getPhotoUrl()       { return photoUrl; }
    public String      getQualification()  { return qualification; }
    public String      getSpecialization() { return specialization; }
    public LocalDate   getJoiningDate()    { return joiningDate; }
    public Instant     getCreatedAt()      { return createdAt; }
    public Instant     getUpdatedAt()      { return updatedAt; }
}
