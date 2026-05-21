# Ai Module

## Overview
Implemented: AI gateway, copilot, prompts, knowledge base, embeddings with pgvector, usage logging and metrics.

## Business Purpose
Provide controlled AI assistance over prompts, knowledge base, usage budgets, embeddings, and tenant-scoped retrieval.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `ai`.

## APIs
Detected endpoint method counts for related packages: ANY:4, DELETE:1, GET:5, PATCH:2, POST:5.
Use `docs/11-apis` and OpenAPI `/v3/api-docs` for full request/response schema.

## Validations
- Validate tenant ownership and school ownership before reads or writes.
- Validate state transitions in service layer.
- Validate DTO shape with Bean Validation or explicit service checks.

## RBAC
- Backend route and method RBAC are authoritative.
- Frontend/mobile role rendering is convenience only.

## Edge Cases
- Cross-tenant object id must not leak existence.
- Soft-deleted/inactive records must not appear in active lists unless requested.
- Retryable operations must be idempotent where external systems or queues are involved.

## Audit Rules
- Mutations must write audit events with actor, tenant, action, target, timestamp, and safe metadata.

## Lifecycle Handling
- Preserve history for academic, finance, attendance, student lifecycle, subscription, and published website state.

## Tenant Isolation
- All tenant-owned repositories must include tenant predicates.
- Async/event consumers must carry tenant context explicitly.

## Dependencies
- `backend/src/main/java/com/cloudcampus/ai/config/AiConfiguration.java`
- `backend/src/main/java/com/cloudcampus/ai/copilot/SchoolAdminAiCopilotController.java`
- `backend/src/main/java/com/cloudcampus/ai/copilot/dto/CopilotQueryRequest.java`
- `backend/src/main/java/com/cloudcampus/ai/copilot/dto/CopilotQueryResponse.java`
- `backend/src/main/java/com/cloudcampus/ai/embedding/service/EmbeddingService.java`
- `backend/src/main/java/com/cloudcampus/ai/embedding/service/EmbeddingServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/ai/gateway/AiGatewayService.java`
- `backend/src/main/java/com/cloudcampus/ai/gateway/AiRateLimiterService.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/AiInsightAudience.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/AiInsightCard.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/AiInsightSeverity.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/ParentWeeklySummaryInsightService.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/StudentRiskInsightService.java`
- `backend/src/main/java/com/cloudcampus/ai/insights/TeacherWorkloadInsightService.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/controller/KnowledgeBaseController.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/dto/IngestRequest.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/dto/KnowledgeDocumentResponse.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/dto/RagQueryRequest.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/dto/RagQueryResponse.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/entity/KnowledgeDocument.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/repository/KnowledgeDocumentRepository.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/service/KnowledgeBaseService.java`
- `backend/src/main/java/com/cloudcampus/ai/knowledge/service/KnowledgeBaseServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/ai/prompt/controller/PromptController.java`
- `backend/src/main/java/com/cloudcampus/ai/prompt/dto/CreatePromptRequest.java`
- ... 10 additional files omitted for focus


## UI Behavior
- Frontend feature folders and mobile screens must call backend APIs through shared API clients.
- UI must handle loading, empty, validation, forbidden, and tenant-suspended states.

## Event Flow
- Use queues/events for notifications, analytics, and async audit work.
- Do not perform long external dispatch on request threads.

## Security Concerns
- No raw UUIDs as user-facing labels.
- No PII/secrets in logs, public analytics, AI prompts, or audit metadata.

## Future Scalability
- Add pagination for large lists.
- Add indexes matching tenant-scoped filters.
- Add queue-based processing for long-running exports/imports.
