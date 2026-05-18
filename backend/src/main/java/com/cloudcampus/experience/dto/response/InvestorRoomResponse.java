package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.InvestorRoom;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record InvestorRoomResponse(
        UUID id,
        String roomCode,
        String title,
        String accessMode,
        Instant expiresAt,
        Map<String, Object> content,
        Map<String, Object> branding,
        String status,
        List<InvestorRoomSectionResponse> sections
) {
    public static InvestorRoomResponse from(InvestorRoom r) {
        return new InvestorRoomResponse(
                r.getId(), r.getRoomCode(), r.getTitle(),
                r.getAccessMode(), r.getExpiresAt(),
                r.getContentJson(), r.getBrandingJson(), r.getStatus(),
                List.of()
        );
    }

    public static InvestorRoomResponse metadata(InvestorRoom r) {
        return new InvestorRoomResponse(
                r.getId(), r.getRoomCode(), r.getTitle(),
                r.getAccessMode(), r.getExpiresAt(),
                Map.of(), r.getBrandingJson(), r.getStatus(),
                List.of()
        );
    }

    public static InvestorRoomResponse from(InvestorRoom r, List<InvestorRoomSectionResponse> sections) {
        return new InvestorRoomResponse(
                r.getId(), r.getRoomCode(), r.getTitle(),
                r.getAccessMode(), r.getExpiresAt(),
                r.getContentJson(), r.getBrandingJson(), r.getStatus(),
                sections
        );
    }
}
