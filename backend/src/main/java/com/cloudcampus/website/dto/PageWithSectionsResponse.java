package com.cloudcampus.website.dto;

import java.util.List;

public record PageWithSectionsResponse(
        PageResponse          page,
        List<SectionResponse> sections
) {}
