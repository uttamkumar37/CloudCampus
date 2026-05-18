package com.cloudcampus.experience.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit record for investor room access events (TASK-019).
 * No Hibernate @Filter — readable across all rooms for security reviews.
 * No FK on room_id — deleted rooms must not erase their access history.
 */
@Entity
@Table(name = "investor_room_access_log")
public class InvestorRoomAccessLog {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "room_id", nullable = false, updatable = false)
    private UUID roomId;

    @Column(name = "room_code", nullable = false, updatable = false, length = 40)
    private String roomCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 30)
    private InvestorRoomAccessEvent event;

    @Column(name = "access_mode", updatable = false, length = 20)
    private String accessMode;

    @Column(name = "client_ip", updatable = false, length = 64)
    private String clientIp;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    protected InvestorRoomAccessLog() {}

    @PrePersist
    void onPersist() {
        if (id         == null) id         = UUID.randomUUID();
        if (occurredAt == null) occurredAt = Instant.now();
    }

    public static InvestorRoomAccessLog create(InvestorRoomAccessEvent event,
                                               UUID roomId, String roomCode,
                                               String accessMode, String clientIp) {
        InvestorRoomAccessLog e = new InvestorRoomAccessLog();
        e.event      = event;
        e.roomId     = roomId;
        e.roomCode   = roomCode;
        e.accessMode = accessMode;
        e.clientIp   = clientIp;
        return e;
    }

    public UUID                   getId()         { return id; }
    public UUID                   getRoomId()     { return roomId; }
    public String                 getRoomCode()   { return roomCode; }
    public InvestorRoomAccessEvent getEvent()      { return event; }
    public String                 getAccessMode() { return accessMode; }
    public String                 getClientIp()   { return clientIp; }
    public Instant                getOccurredAt() { return occurredAt; }
}
