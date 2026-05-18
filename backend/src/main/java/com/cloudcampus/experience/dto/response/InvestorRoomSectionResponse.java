package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.InvestorRoomSection;

import java.util.Map;
import java.util.UUID;

public record InvestorRoomSectionResponse(
        UUID id,
        int position,
        String sectionType,
        Map<String, Object> content
) {
    public static InvestorRoomSectionResponse from(InvestorRoomSection s) {
        return new InvestorRoomSectionResponse(
                s.getId(), s.getPosition(), s.getSectionType(), s.getContentJson()
        );
    }
}
