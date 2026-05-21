# Fee Module

## Overview
Implemented: fee categories, structures, student fee records, offline recording, invoice PDF, Razorpay order/verification/webhook flow.

## Business Purpose
Configure fees, assign student obligations, collect payments, produce receipts/invoices, and reconcile gateway callbacks idempotently.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `finance, payment`.

## APIs
Detected endpoint method counts for related packages: ANY:1, GET:8, PATCH:2, POST:8.
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
- `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/CreateFeeCategoryRequest.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/CreateFeeStructureRequest.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/CreateStudentFeeRecordRequest.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/FeeCategoryResponse.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/FeePaymentResponse.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/FeeReceiptResponse.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/FeeStructureResponse.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/RecordPaymentRequest.java`
- `backend/src/main/java/com/cloudcampus/finance/dto/StudentFeeRecordResponse.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/FeeCategory.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/FeeFrequency.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/FeePayment.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/FeeStatus.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/FeeStructure.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/PaymentMode.java`
- `backend/src/main/java/com/cloudcampus/finance/entity/StudentFeeRecord.java`
- `backend/src/main/java/com/cloudcampus/finance/repository/FeeCategoryRepository.java`
- `backend/src/main/java/com/cloudcampus/finance/repository/FeePaymentRepository.java`
- `backend/src/main/java/com/cloudcampus/finance/repository/FeeStructureRepository.java`
- `backend/src/main/java/com/cloudcampus/finance/repository/StudentFeeRecordRepository.java`
- `backend/src/main/java/com/cloudcampus/finance/scheduler/FeeReminderScheduler.java`
- `backend/src/main/java/com/cloudcampus/finance/service/FeeInvoicePdfService.java`
- `backend/src/main/java/com/cloudcampus/finance/service/FeeService.java`
- `backend/src/main/java/com/cloudcampus/finance/service/FeeServiceImpl.java`
- ... 9 additional files omitted for focus


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
