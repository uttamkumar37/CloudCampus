package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_investor_room_sections")
public class InvestorRoomSection {

    @Id private UUID id;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "section_type", nullable = false, length = 40)
    private String sectionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> contentJson;

    @Column(name = "visibility", nullable = false, length = 20)
    private String visibility;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected InvestorRoomSection() {}

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (visibility == null) visibility = "VISIBLE";
    }

    public UUID                getId()          { return id; }
    public UUID                getRoomId()      { return roomId; }
    public int                 getPosition()    { return position; }
    public String              getSectionType() { return sectionType; }
    public Map<String, Object> getContentJson() { return contentJson; }
    public String              getVisibility()  { return visibility; }
    public Instant             getCreatedAt()   { return createdAt; }
}
