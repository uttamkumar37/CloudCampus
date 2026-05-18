package com.cloudcampus.experience.dto.response;

public record AiContentGenerateResponse(
        String generatedContent,
        int tokensUsed
) {}
