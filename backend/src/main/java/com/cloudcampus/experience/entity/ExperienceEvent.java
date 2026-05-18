package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_experience_events")
public class ExperienceEvent {

    @Id private UUID id;

    @Column(name = "session_id", nullable = false, length = 128)
    private String sessionId;

    @Column(name = "visitor_id", length = 128)
    private String visitorId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "event_data", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> eventData;

    @Column(name = "page_path", length = 500)
    private String pagePath;

    @Column(name = "referrer", length = 500)
    private String referrer;

    @Column(name = "utm_source", length = 120)
    private String utmSource;

    @Column(name = "utm_medium", length = 120)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 120)
    private String utmCampaign;

    @Column(name = "device_type", length = 20)
    private String deviceType;

    @Column(name = "country_code", length = 4)
    private String countryCode;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ExperienceEvent() {}

    public static ExperienceEvent of(String sessionId, String visitorId, UUID tenantId,
                                     String eventType, Map<String, Object> eventData,
                                     String pagePath, String utmSource, String utmMedium,
                                     String utmCampaign, String deviceType,
                                     String countryCode, String ipHash) {
        ExperienceEvent e = new ExperienceEvent();
        e.sessionId   = sessionId;
        e.visitorId   = visitorId;
        e.tenantId    = tenantId;
        e.eventType   = eventType;
        e.eventData   = eventData != null ? eventData : Map.of();
        e.pagePath    = pagePath;
        e.utmSource   = utmSource;
        e.utmMedium   = utmMedium;
        e.utmCampaign = utmCampaign;
        e.deviceType  = deviceType;
        e.countryCode = countryCode;
        e.ipHash      = ipHash;
        return e;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID                getId()          { return id; }
    public String              getSessionId()   { return sessionId; }
    public String              getVisitorId()   { return visitorId; }
    public UUID                getTenantId()    { return tenantId; }
    public String              getEventType()   { return eventType; }
    public Map<String, Object> getEventData()   { return eventData; }
    public String              getPagePath()    { return pagePath; }
    public String              getUtmSource()   { return utmSource; }
    public String              getUtmMedium()   { return utmMedium; }
    public String              getUtmCampaign() { return utmCampaign; }
    public String              getDeviceType()  { return deviceType; }
    public String              getCountryCode() { return countryCode; }
    public String              getIpHash()      { return ipHash; }
    public Instant             getCreatedAt()   { return createdAt; }
}
