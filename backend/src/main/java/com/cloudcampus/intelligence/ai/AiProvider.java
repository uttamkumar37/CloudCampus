package com.cloudcampus.intelligence.ai;

public interface AiProvider {

    AiProviderResponse generate(AiProviderRequest request);
}
