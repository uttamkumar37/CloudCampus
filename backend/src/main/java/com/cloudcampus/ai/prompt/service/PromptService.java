package com.cloudcampus.ai.prompt.service;

import com.cloudcampus.ai.prompt.dto.CreatePromptRequest;
import com.cloudcampus.ai.prompt.dto.PromptRenderRequest;
import com.cloudcampus.ai.prompt.dto.PromptRenderResponse;
import com.cloudcampus.ai.prompt.dto.PromptTemplateResponse;

import java.util.List;
import java.util.UUID;

public interface PromptService {

    List<PromptTemplateResponse> listAll();

    List<PromptTemplateResponse> listByKey(String promptKey);

    PromptTemplateResponse getById(UUID id);

    /** Creates version 1 (or next version) of the given prompt key. Starts inactive. */
    PromptTemplateResponse create(CreatePromptRequest request, UUID createdBy);

    /** Activates this version and deactivates all other versions of the same key. */
    PromptTemplateResponse activate(UUID id);

    /** Deactivates this version (no active version for the key until another is activated). */
    PromptTemplateResponse deactivate(UUID id);

    /** Renders the template with the provided variables and sends it to the AI. */
    PromptRenderResponse render(UUID id, PromptRenderRequest request);
}
