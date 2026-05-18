package com.cloudcampus.ai.copilot.dto;

/**
 * Response for the school-admin AI Copilot query endpoint (CC-1603).
 *
 * @param answer     The AI-generated answer text.
 * @param tokensUsed Approximate token count consumed by this request
 *                   (input + output). Zero when served from mock/cache.
 * @param fromCache  True when the response was served from a cached result
 *                   rather than a live AI call.
 */
public record CopilotQueryResponse(
        String  answer,
        int     tokensUsed,
        boolean fromCache
) {}
