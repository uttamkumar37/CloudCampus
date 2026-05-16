package com.cloudcampus.ai.knowledge.dto;

import java.util.List;

public record RagQueryResponse(
        String       answer,
        List<String> sourceTitles,
        int          chunksUsed
) {}
