package com.cloudcampus.ai.copilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request body for the school-admin AI Copilot query endpoint (CC-1603).
 *
 * @param question    The administrator's natural-language question. Required, max 1000 chars.
 * @param contextKeys Optional list of domain-hint keys (e.g. "attendance", "fees") that
 *                    the caller can supply to steer the prompt. Max 20 entries.
 */
public record CopilotQueryRequest(
        @NotBlank @Size(max = 1000) String question,
        @Size(max = 20)             List<String> contextKeys
) {}
