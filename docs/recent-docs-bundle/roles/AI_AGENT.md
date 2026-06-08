<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI_AGENT

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Ai Agent | CURRENT_IMPLEMENTED |
| Role enum value | AI_AGENT | CURRENT_IMPLEMENTED |
| Role type | AI | CURRENT_IMPLEMENTED |
| Login allowed | no | CURRENT_IMPLEMENTED |
| MFA required | no/configurable; SYSTEM and AI_AGENT are non-login | CURRENT_IMPLEMENTED |
| Scope level | AI policy scope | CURRENT_IMPLEMENTED |
| Typical users | Internal AI recommender and automation actor | CURRENT_IMPLEMENTED |
| Business purpose | Create recommendations, drafts, and automation suggestions without final sensitive approval. | CURRENT_IMPLEMENTED |
| Risk level | critical | CURRENT_IMPLEMENTED |
| Data sensitivity level | AI-derived recommendations and scoped source data | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: AI Activity.
- CURRENT_IMPLEMENTED: Call 0 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: AI activity - Non-login actor.
- CURRENT_PARTIAL: Some responsibilities depend on module APIs/UI surfaces and are listed in matrices.
- PLANNED_RECOMMENDED: Draft and recommend only; final sensitive actions require human approval.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside AI policy scope scope.
- CURRENT_IMPLEMENTED: Interactive login and refresh are blocked.
- CURRENT_IMPLEMENTED: Must not access /v1/super-admin APIs unless role is SUPER_ADMIN.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: CURRENT_IMPLEMENTED derived from authenticated user/server context.
- school_id rules: CURRENT_PARTIAL bounded by policy/public/system path.
- class/section/subject rules: CURRENT_PARTIAL module-specific.
- own-student record rules: CURRENT_PARTIAL applies to student self APIs.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED denied for non-SUPER_ADMIN services.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| CREATE_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | Create AI recommendations and drafts. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| AI Activity | dashboard | Yes | SESSION_SELF_MANAGE | /v1/me | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: Ai Agent Overview
- widgets/cards: AI activity
- metrics: CURRENT_PARTIAL from /v1/me/session shell.
- API source: /v1/me
- loading state: CURRENT_IMPLEMENTED shell and page loading states.
- empty state: CURRENT_IMPLEMENTED generic empty states; module-specific quality CURRENT_PARTIAL.
- error state: CURRENT_IMPLEMENTED API/form error panels.
- refresh behavior: CURRENT_PARTIAL manual navigation/refetch; no uniform live refresh found.

## 8. API access matrix
| Method | Endpoint | Allowed? | Required permission | Required scope | Request params/body | Response DTO | Audit event | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | No role-specific internal API | No | n/a | n/a | n/a | n/a | n/a | NOT_FOUND_IN_CODEBASE |

## 9. Detailed API behavior
- NOT_FOUND_IN_CODEBASE: no role-specific backend endpoint discovered beyond public/session behavior.

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| AI draft/recommendation | AI_AGENT | AI policy allows feature | Create recommendation/draft | Recommendation awaits human review | AI_RECOMMENDATION_CREATED | No direct sensitive mutation |

### Workflow detail notes
- UI screen: CURRENT_IMPLEMENTED screens are listed in section 6.
- API sequence: login/MFA if needed, /v1/me hydration, screen-specific reads, command write, refetch/state update.
- Request/response examples: see section 9 and docs/api/*.md.
- Notifications created: CURRENT_PARTIAL module-specific.
- Background jobs created: CURRENT_IMPLEMENTED for report exports/bulk jobs where endpoints exist.
- Failure cases: 400/401/403/404/409/429/500 depending validation/auth/scope/conflict/rate limit.
- Recovery behavior: retry safe reads; commands should use service transaction rollback or explicit job failure state.

## 11. AI recommendation and automation behavior
| Capability | Status | Notes |
| --- | --- | --- |
| Can view AI recommendations? | NOT_FOUND_IN_CODEBASE | Role AI panels/API endpoints where permitted. |
| Can create AI recommendations? | PLANNED_RECOMMENDED | Super Admin governance can create; AI_AGENT should be internal/non-login. |
| Can approve AI recommendations? | PLANNED_RECOMMENDED | High impact should require human approval. |
| Can reject AI recommendations? | CURRENT_PARTIAL | Reject/dismiss APIs exist by flow. |
| Can execute approved AI action? | CURRENT_PARTIAL | Execution must remain policy-controlled. |
| Can configure AI policy? | NOT_FOUND_IN_CODEBASE | Platform policy endpoints are Super Admin in current backend. |
| Can run automation? | PLANNED_RECOMMENDED | Automation rules/runs exist. |
| Can approve automation? | PLANNED_RECOMMENDED | Approval matrix in docs/ai/AI_APPROVAL_MATRIX.md. |
| Allowed risk levels | LOW/MEDIUM recommended; HIGH requires approval | CURRENT_PARTIAL enforcement by service. |
| Recommendation types allowed | Role-specific AI types for academic, finance, office, parent/student study help. | CURRENT_PARTIAL |
| What AI must never do | Direct sensitive mutation without approval, cross-tenant access, hidden finance/marks/subscription/user changes. | PLANNED_RECOMMENDED |
| Human approval rules | High-risk and sensitive actions require human approval. | CURRENT_PARTIAL |

## 12. Notification behavior
| Behavior | Status | Details |
| --- | --- | --- |
| Notifications this role can receive | NOT_FOUND_IN_CODEBASE | Delivery records exist; role inbox UI varies. |
| Notifications this role can send | NOT_FOUND_IN_CODEBASE | Notice/notification sending depends on module endpoints. |
| Message approval requirement | PLANNED_RECOMMENDED | AI-drafted messages should require human approval. |
| Recipient masking rules | CURRENT_IMPLEMENTED | Notification delivery DTO exposes maskedRecipient. |
| Delivery audit | CURRENT_PARTIAL | Delivery rows track status/failure; explicit audit varies. |
| Retry behavior | CURRENT_PARTIAL | Outbox/retry infrastructure exists; scheduler policy should be verified. |

## 13. Reports and exports
| Report/export item | Status | Notes |
| --- | --- | --- |
| Reports visible | CURRENT_PARTIAL | Reports nav/screen visibility from App.tsx. |
| Export permissions | PLANNED_RECOMMENDED | Export endpoints documented in Report API. |
| Async export behavior | CURRENT_IMPLEMENTED | Report export jobs/files and worker classes exist. |
| Sensitive field masking | CURRENT_PARTIAL | Must be reviewed per report/export DTO. |
| Download permission | PLANNED_RECOMMENDED | School export download exists; platform download varies. |
| Audit requirement | CURRENT_IMPLEMENTED | REPORT_EXPORT_* enum values exist. |
| MFA-fresh requirement | PLANNED_RECOMMENDED | Login MFA exists for privileged roles; endpoint freshness not uniform. |

## 14. Security risks and controls
- vertical privilege escalation risks: CURRENT_IMPLEMENTED Super Admin service guards; PLANNED_RECOMMENDED full role-matrix tests.
- horizontal tenant/school access risks: CURRENT_IMPLEMENTED scope patterns and spoofing filter; CURRENT_PARTIAL per-module tests.
- sensitive data exposure risks: CURRENT_PARTIAL field masking review needed.
- AI risks: CURRENT_PARTIAL governance exists; central risk approval policy recommended.
- payment/finance risks: CURRENT_IMPLEMENTED finance audit/API foundations; PLANNED_RECOMMENDED MFA freshness/refund approvals.
- mitigation in current code: JWT auth, MFA roles, non-login system actors, audit logging, role/scope services, constraints/indexes.
- missing controls if any: OpenAPI, endpoint rate limits, field-level privacy tests, comprehensive role-permission tests.

## 15. Test cases
| Test case | Type | Preconditions | Steps | Expected result | Current coverage |
| --- | --- | --- | --- | --- | --- |
| AI_AGENT login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| AI_AGENT forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| AI_AGENT scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| AI_AGENT dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| AI_AGENT AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| AI_AGENT report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

## 16. Edge cases
- missing token: CURRENT_IMPLEMENTED protected APIs return 401.
- expired session: CURRENT_IMPLEMENTED JWT/session services reject expired tokens; refresh flow exists.
- inactive user: CURRENT_IMPLEMENTED auth blocks inactive users.
- suspended tenant: CURRENT_PARTIAL tenant status modeled; every endpoint should verify behavior.
- inactive school: CURRENT_PARTIAL school active checks are module-specific.
- no active school context: CURRENT_IMPLEMENTED/CURRENT_PARTIAL school APIs require active/allowed school.
- user with multiple roles: CURRENT_IMPLEMENTED role assignment model exists.
- user with conflicting permission override: CURRENT_IMPLEMENTED override model exists; test edge behavior.
- user linked to multiple schools: CURRENT_IMPLEMENTED allowed school list and activation endpoint exist.
- parent with multiple children: CURRENT_IMPLEMENTED guardian/child models exist; UI behavior CURRENT_PARTIAL.
- teacher with multiple class assignments: CURRENT_IMPLEMENTED teacher assignment model exists.
- zero records: CURRENT_IMPLEMENTED/CURRENT_PARTIAL empty states.
- large data pagination: CURRENT_IMPLEMENTED indexes/page responses; UI often uses fixed size.
- invalid filters: CURRENT_PARTIAL endpoint-specific validation.
- deleted/inactive linked records: CURRENT_PARTIAL deactivation/read visibility must be verified.

## 17. Open gaps
| Gap type | Status | Detail |
| --- | --- | --- |
| missing API | CURRENT_PARTIAL | See docs/gaps/CURRENT_GAPS_AND_TODOS.md. |
| missing UI | BACKEND_EXISTS_UI_NOT_SURFACED | Backend endpoints without frontend callers are listed in docs/API_INDEX.md. |
| missing tests | CURRENT_PARTIAL | Direct endpoint tests are not present for every controller. |
| missing validation | CURRENT_PARTIAL | DTO validation not uniform. |
| missing audit | CURRENT_PARTIAL | Read APIs and some settings/list interactions may not audit. |
| performance risk | CURRENT_PARTIAL | Broad lists need page max and explain plans. |
| security risk | CURRENT_PARTIAL | MFA freshness and field privacy checks recommended. |
| documentation uncertainty | CURRENT_PARTIAL | Generated from static code scan; runtime contract tests should verify. |

## 18. Final checklist
| Item | Status | Notes |
| --- | --- | --- |
| Role enum documented | CURRENT_IMPLEMENTED | AI_AGENT |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | non-login / no role MFA |
| Scope documented | CURRENT_IMPLEMENTED | AI policy scope |
| Permissions documented | CURRENT_IMPLEMENTED | 1 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 1 screens |
| APIs documented | CURRENT_PARTIAL | 0 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
