package com.cloudcampus.ai.prompt.dto;

public record PromptRenderResponse(
        String renderedPrompt,   // template after variable substitution
        String aiResponse        // raw text from the AI provider
) {}
