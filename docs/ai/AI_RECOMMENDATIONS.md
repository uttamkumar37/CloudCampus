<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI Recommendations

Status: CURRENT_IMPLEMENTED

| Action | Endpoint status | Audit | Notes |
| --- | --- | --- | --- |
| POST /v1/ai/recommendations/{id}/accept | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_APPROVED | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT; FINANCE_STAFF only for active-school `FEE_REMINDER_SUGGESTION`; PARENT and OFFICE_STAFF are service-denied for mutations. |
| POST /v1/ai/recommendations/{id}/approve | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_APPROVED | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT; FINANCE_STAFF only for active-school `FEE_REMINDER_SUGGESTION` with `APPROVE_AI_RECOMMENDATIONS`; PARENT and OFFICE_STAFF are denied. |
| POST /v1/ai/recommendations/{id}/dismiss | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_DISMISSED | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT; FINANCE_STAFF only for active-school `FEE_REMINDER_SUGGESTION`; PARENT and OFFICE_STAFF are denied. |
| POST /v1/ai/recommendations/{id}/execute | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_EXECUTED | Requires automation policy permission; FINANCE_STAFF, PARENT, and OFFICE_STAFF are denied by default. |
| POST /v1/ai/recommendations/{id}/reject | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_REJECTED | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT; FINANCE_STAFF only for active-school `FEE_REMINDER_SUGGESTION`; PARENT and OFFICE_STAFF are denied. |
| GET /v1/ai/recommendations/{id} | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | PARENT can read approved active-school linked-child recommendations; OFFICE_STAFF can read approved active-school `ADMISSION_FOLLOW_UP`; FINANCE_STAFF can read active-school `FEE_REMINDER_SUGGESTION`; other scoped roles follow AI policy scope. |
| GET /v1/ai/recommendations | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | PARENT can read approved active-school linked-child recommendations; OFFICE_STAFF can read approved active-school `ADMISSION_FOLLOW_UP`; FINANCE_STAFF can read active-school `FEE_REMINDER_SUGGESTION`; other scoped roles follow AI policy scope. |
| POST /v1/super-admin/ai/recommendations/{id}/approve | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_APPROVED | SUPER_ADMIN; Read or act on AI recommendations. |
| POST /v1/super-admin/ai/recommendations/{id}/execute | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_EXECUTED | SUPER_ADMIN; Read or act on AI recommendations. |
| POST /v1/super-admin/ai/recommendations/{id}/reject | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_REJECTED | SUPER_ADMIN; Read or act on AI recommendations. |
| GET /v1/super-admin/ai/recommendations/{id} | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | SUPER_ADMIN; Read or act on AI recommendations. |
| GET /v1/super-admin/ai/recommendations | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | SUPER_ADMIN; Read or act on AI recommendations. |
| POST /v1/super-admin/ai/recommendations | CURRENT_IMPLEMENTED | AI_RECOMMENDATION_CREATED | SUPER_ADMIN; Read or act on AI recommendations. |

- CURRENT_IMPLEMENTED: Recommendation endpoints exist for platform and role portal flows.
- CURRENT_IMPLEMENTED: Super Admin portal lists, filters, creates, opens, approves, rejects, and executes recommendations through `/v1/super-admin/ai/recommendations`.
- CURRENT_IMPLEMENTED: OFFICE_STAFF shared AI portal is read-only and limited to approved active-school `ADMISSION_FOLLOW_UP` items. It cannot approve, reject, accept, dismiss, execute, or access AI automation/policy/usage controls.
- CURRENT_IMPLEMENTED: FINANCE_STAFF shared AI portal is limited to active-school `FEE_REMINDER_SUGGESTION` items. It can dismiss/reject/accept low-risk suggestions and approve when `APPROVE_AI_RECOMMENDATIONS` permits, but cannot execute automation or access AI automation, entitlement, or usage-audit controls by default.
- CURRENT_IMPLEMENTED: Super Admin UI requires explicit confirmation before high/critical recommendation execution and does not render raw prompt content.
- CURRENT_PARTIAL: Service-level MFA freshness and exhaustive risk-level negative tests remain open.
- PLANNED_RECOMMENDED: AI_AGENT drafts only.
