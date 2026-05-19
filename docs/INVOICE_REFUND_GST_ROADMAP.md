# Invoice, Refund, and GST Roadmap

Last updated: 2026-05-19

## Purpose

This roadmap defines the production billing work needed for CloudCampus invoices, refunds, GST/tax metadata, receipts, and accounting exports.

CloudCampus currently has fee records, immutable fee payments, receipt numbers, Razorpay payment orders, payment verification, webhook idempotency, and tenant subscription assignment. This roadmap turns those foundations into a formal billing ledger suitable for SaaS operations, school finance teams, accounting exports, and India GST-ready compliance.

## Current State

| Area | Current capability | Gap |
|---|---|---|
| Fee records | Student fee records track amount due, discounts, paid amount, due dates, and status. | They behave like operational dues, not tax invoices. |
| Receipts | `fee_payments` stores immutable payment rows with unique receipt numbers. | Receipts do not carry invoice number, tax breakdown, place of supply, or refund linkage. |
| Online payments | `payment_orders` tracks Razorpay order lifecycle, gateway payment ID, signature, fee payment ID, tenant, school, student, and initiator. | No gateway refund lifecycle or settlement reconciliation model. |
| Subscriptions | Tenant subscriptions track plan and billing cycle. | No SaaS invoice, renewal invoice, credit note, dunning, or tax metadata. |
| Accounting | Finance reports and payment records exist. | No export contract for invoices, refunds, taxes, settlements, or accounting journal rows. |

## Billing Record Model

Introduce append-only billing records instead of mutating payment history:

| Record | Purpose | Mutability |
|---|---|---|
| Invoice | Amount requested from school/tenant/student, with line items and tax metadata. | Immutable after issue; corrections use credit notes. |
| Receipt | Payment acknowledgement linked to one or more invoices/payments. | Immutable after issue. |
| Refund | Money returned through gateway or offline process. | Immutable after gateway confirmation; failed attempts remain recorded. |
| Credit note | Accounting reversal or adjustment for invoice value/tax. | Immutable after issue. |
| Ledger entry | Double-entry style accounting event for invoice, payment, refund, tax, discount, or write-off. | Append-only. |

Each billing record must include:

| Field | Requirement |
|---|---|
| Tenant and school IDs | Required for tenant isolation and accounting exports. |
| Record number | Sequential per tenant/school and financial year. |
| Financial year | Derived from configurable jurisdiction/calendar. |
| Currency | ISO code; default `INR`. |
| Status | Explicit lifecycle state. |
| Source | Fee, SaaS subscription, manual adjustment, refund, or credit note. |
| Audit metadata | Created by, issued by, issued at, voided by/at when allowed. |
| Correlation ID | Stored for traceability to request logs and gateway webhooks. |

## Invoice Roadmap

### Student Fee Invoices

Student fee invoices should be generated from fee structures and student fee records.

| Requirement | Rule |
|---|---|
| Invoice issue | Issue when a fee record becomes billable, not when a payment is collected. |
| Line items | Include fee category, academic year, class/section context, discount, taxable amount, and tax components. |
| Partial payments | Invoice remains open until fully paid, waived, credited, or written off. |
| Receipts | Each payment creates a receipt linked to invoice and payment rows. |
| Waivers | Waivers create credit note or write-off ledger entries, not silent invoice mutation. |
| Tenant isolation | Invoice queries must always scope by tenant and school. |

### SaaS Subscription Invoices

Tenant subscription invoices should be generated for plan assignment, renewal, upgrades, downgrades, and manual billing.

| Event | Invoice behavior |
|---|---|
| New paid subscription | Issue invoice for the first billing period. |
| Trial | No tax invoice unless a paid charge is created. |
| Renewal | Issue invoice at period start or according to configured billing policy. |
| Upgrade | Prorated invoice or immediate add-on invoice. |
| Downgrade | Future-period credit note or next-cycle adjustment. |
| Cancellation | Final invoice or credit note if applicable. |

## GST and Tax Metadata

GST/tax metadata must be stored on invoice and credit note records, not inferred later from mutable school settings.

| Field | Rule |
|---|---|
| Supplier GSTIN | Required when issuing GST invoices in India. |
| Customer GSTIN | Optional for parents/students; required for B2B school/tenant billing when available. |
| Legal name | Snapshot at invoice issue time. |
| Billing address | Snapshot at invoice issue time. |
| Place of supply | Required for GST tax type selection. |
| HSN/SAC code | Required per taxable line item where applicable. |
| Tax rate | Snapshot on each line item. |
| CGST/SGST/IGST | Calculated per place-of-supply and supplier/customer state. |
| Reverse charge | Explicit boolean when applicable. |
| Exemption reason | Required when tax rate is zero or exempt. |

Tax calculations must be deterministic and replayable from invoice snapshots. Changing tenant/school tax settings must affect only future invoices.

## Refund Roadmap

Refunds must be modeled as first-class records with explicit gateway and accounting state.

| Step | Requirement |
|---|---|
| Request | Capture requester, reason, invoice, receipt/payment, amount, and approval requirement. |
| Approval | Require role-gated approval for online or high-value refunds. |
| Gateway action | For Razorpay payments, call gateway refund API with idempotency key. |
| Webhook confirmation | Confirm refund status from signed gateway webhook where available. |
| Accounting | Create refund ledger entry and credit note when tax/accounting rules require it. |
| Notification | Send refund receipt/confirmation to payer when configured. |
| Audit | Record request, approval, gateway call, webhook confirmation, and failure reason. |

Refund statuses:

| Status | Meaning |
|---|---|
| `REQUESTED` | Refund intent captured but not approved. |
| `APPROVED` | Ready for gateway/offline processing. |
| `PROCESSING` | Submitted to gateway or finance team. |
| `SUCCEEDED` | Money returned or offline refund completed. |
| `FAILED` | Gateway/offline attempt failed. |
| `CANCELLED` | Request cancelled before processing. |

Refunds must never delete or mutate the original payment row.

## Receipt Roadmap

Receipts should remain immutable payment acknowledgements, with richer links:

| Receipt field | Rule |
|---|---|
| Receipt number | Sequential per school/financial year or per configured entity. |
| Linked invoice IDs | Required for invoice-backed payments. |
| Linked payment IDs | Required for every receipt. |
| Gateway references | Store order ID, payment ID, settlement ID when available. |
| Payer details | Snapshot visible payer name/contact when available. |
| Tax summary | Show invoice tax summary when receipt is invoice-backed. |
| Refund status | Show refunded/partially refunded amount where applicable. |

Existing fee receipt endpoints should keep working while new invoice-backed receipts are introduced behind versioned DTOs or optional fields.

## Accounting Export Roadmap

Accounting exports should be generated from immutable billing records and ledger entries.

| Export | Required columns |
|---|---|
| Invoice register | Invoice number, date, tenant, school, customer, taxable value, tax, gross total, status. |
| Receipt register | Receipt number, payment date, mode, gateway reference, invoice numbers, amount. |
| Refund register | Refund number, original receipt, gateway refund ID, reason, amount, status. |
| GST register | GSTIN, place of supply, HSN/SAC, taxable value, CGST, SGST, IGST, exemption reason. |
| Accounting journal | Date, account code, debit, credit, entity, source record, narration. |
| Settlement export | Gateway settlement ID, payment IDs, fees, taxes, net settlement, bank date. |

Exports must support:

1. Tenant, school, date range, financial year, and status filters.
2. CSV as the first delivery format.
3. Stable column names and UTC timestamps.
4. Idempotent regeneration for the same filters.
5. Export audit events with requester, filter summary, row count, and file object key.

## Implementation Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| Phase 1 | Data model for invoices, invoice lines, tax snapshots, receipts, refunds, credit notes, and ledger entries. | Migrations reviewed; tenant/school indexes added; immutable constraints defined. |
| Phase 2 | Invoice generation from student fee records and tenant subscriptions. | Unit and integration tests prove issue, partial payment, full payment, waiver/write-off, and subscription invoice flows. |
| Phase 3 | GST/tax calculation and invoice rendering. | Tax snapshots, place-of-supply logic, invoice PDF/HTML, and zero/exempt tax handling validated. |
| Phase 4 | Refund workflow and Razorpay refund integration. | Approved refund, gateway idempotency, webhook confirmation, failure, and accounting entries validated. |
| Phase 5 | Accounting exports and reconciliation evidence. | CSV exports, audit trail, and settlement matching ready for finance review. |

## Controls

| Control | Requirement |
|---|---|
| Immutability | Issued invoices, receipts, refunds, credit notes, and ledger entries are append-only. |
| Numbering | Invoice, receipt, refund, and credit note numbers use DB sequences, not count-based generation. |
| Tenant safety | All reads/writes scope by tenant, and school-level records scope by school where applicable. |
| Approval | Refunds and credit notes require role-gated approval above configured thresholds. |
| Idempotency | Gateway payment/refund events and export jobs use idempotency keys. |
| Audit | Every issue, payment, refund, export, void, and approval event writes an audit entry. |
| PII | Exports include only required billing identity fields and are stored with retention controls. |

## Validation Checklist

Before production release, prove:

1. Invoices can be issued for fee records and subscription billing periods.
2. Receipts link to invoice and payment records without mutating the original payment.
3. GST/tax metadata is snapshotted and does not change when school settings change later.
4. Refunds create refund records, gateway references, ledger entries, and audit events.
5. Partial refunds and failed refunds do not corrupt invoice/payment status.
6. Accounting exports reconcile invoice totals, receipt totals, refund totals, tax totals, and gateway settlements.
7. Tenant and school isolation tests cover invoices, refunds, receipts, tax metadata, and exports.

## Validation

TASK-044 validation command:

```bash
rg -n "invoice|refund|GST|tax" docs PRODUCTION_READY_ROADMAP.md
```
