package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_logistics_profiles")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentLogisticsProfile {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "transport_mode")
    private String transportMode;

    @Column(name = "route_name")
    private String routeName;

    @Column(name = "pickup_point")
    private String pickupPoint;

    @Column(name = "drop_point")
    private String dropPoint;

    @Column(name = "hostel_name")
    private String hostelName;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "warden_contact")
    private String wardenContact;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StudentLogisticsProfile() {}

    public static StudentLogisticsProfile create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentLogisticsProfile p = new StudentLogisticsProfile();
        p.tenantId = tenantId;
        p.schoolId = schoolId;
        p.studentId = studentId;
        return p;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getTransportMode() { return transportMode; }
    public String getRouteName() { return routeName; }
    public String getPickupPoint() { return pickupPoint; }
    public String getDropPoint() { return dropPoint; }
    public String getHostelName() { return hostelName; }
    public String getRoomNumber() { return roomNumber; }
    public String getWardenContact() { return wardenContact; }

    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    public void setRouteName(String routeName) { this.routeName = routeName; }
    public void setPickupPoint(String pickupPoint) { this.pickupPoint = pickupPoint; }
    public void setDropPoint(String dropPoint) { this.dropPoint = dropPoint; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public void setWardenContact(String wardenContact) { this.wardenContact = wardenContact; }
}
