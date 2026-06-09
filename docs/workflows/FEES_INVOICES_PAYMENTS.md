<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Fees Invoices Payments

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | FINANCE_STAFF/SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | FINANCE_STAFF/SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Form/query input | Submit/filter/search | fees\|payments\|receipts\|invoices\|revenue | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | FINANCE_STAFF/SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Role/scope allowed | API call | POST /v1/finance/fees/demands/{demandId}/payments<br>GET /v1/finance/fees/demands/{demandId}<br>GET /v1/finance/fees/demands<br>POST /v1/finance/fees/demands<br>GET /v1/finance/receipts<br>POST /v1/parent/children/{studentId}/fees/{demandId}/payments<br>GET /v1/parent/children/{studentId}/fees<br>POST /v1/school-admin/fees/demands/{demandId}/payments | Domain records/jobs change | FEE_PAYMENT_RECORDED, RECEIPT_ISSUED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>FEE_DEMAND_CREATED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>FEE_PAYMENT_RECORDED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | FINANCE_STAFF/SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| POST | /v1/finance/fees/demands/{demandId}/payments | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/finance/fees/demands/{demandId} | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/finance/fees/demands | Finance | CURRENT_IMPLEMENTED |
| POST | /v1/finance/fees/demands | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/finance/receipts | Finance | CURRENT_IMPLEMENTED |
| POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/fees | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands/{demandId}/payments | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands/{demandId} | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands | Finance | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/student/fees | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/invoices | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/summary | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/tenants | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/trends | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | Subscription | CURRENT_IMPLEMENTED |
