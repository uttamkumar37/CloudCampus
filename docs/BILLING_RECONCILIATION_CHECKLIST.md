# Billing Reconciliation Checklist

Last updated: 2026-05-19

## Purpose

This checklist defines how CloudCampus should reconcile gateway events, internal payment records, invoices, refunds, ledger records, settlements, and failed webhooks.

Use it for month-end finance close, payment incident review, gateway migration, production launch readiness, and any release that changes payment, invoice, refund, subscription billing, or accounting export behavior.

## Current System Anchors

| Surface | Current record | Reconciliation use |
|---|---|---|
| Student invoices | `student_fee_records` | Amount due, discount, amount paid, status, tenant, school, student. |
| Payment transactions | `fee_payments` | Immutable payment amount, mode, reference number, receipt number, collection date. |
| Gateway orders | `payment_orders` | Razorpay order ID, payment ID, amount in paise, status, student, tenant, school, fee payment link. |
| Gateway webhook events | `payment_gateway_events` | Event ID, payload hash, status, processed timestamp, failed/ignored event evidence. |
| Receipts | Receipt DTO/PDF and notification templates | Payer-facing proof of payment. |
| Future billing ledger | Invoice/refund/GST roadmap | Formal invoices, refunds, credit notes, tax snapshots, accounting journal rows. |

## Reconciliation Inputs

Collect these before starting:

| Input | Required evidence |
|---|---|
| Date range | Start/end date and timezone used for finance close. |
| Tenant/school scope | Tenant ID and school ID filters, or explicit all-tenant close approval. |
| Gateway report | Razorpay payments, refunds, failed payments, and settlement reports. |
| Internal payments | `fee_payments` export for the same date range. |
| Payment orders | `payment_orders` export including pending, success, failed, and expired orders. |
| Webhook events | `payment_gateway_events` export including processed, failed, ignored, and duplicate events. |
| Invoice register | Current student fee records and future issued invoices. |
| Refund register | Future refund records and gateway refund IDs. |
| Ledger export | Future invoice/payment/refund/tax journal entries. |

## Daily Payment Reconciliation

| Check | Pass condition |
|---|---|
| Gateway captured payments | Every captured Razorpay payment has one matching `payment_orders.gateway_payment_id`. |
| Internal success orders | Every `payment_orders.status = SUCCESS` has a non-null `fee_payment_id`. |
| Fee payment linkage | Every online `fee_payments.reference_number` maps to one successful payment order. |
| Amount match | Gateway amount in paise equals `payment_orders.amount_paise` and `fee_payments.amount * 100`. |
| Tenant/school match | Payment order tenant/school matches the fee record tenant/school. |
| Student match | Payment order student matches the linked fee record student. |
| Receipt number | Each successful internal payment has a unique receipt number. |
| Duplicate gateway payment | No two payment orders share the same non-null gateway payment ID. |

Discrepancies must be tagged as gateway delay, webhook delay, duplicate attempt, manual payment, refund, chargeback, configuration issue, or data defect.

## Invoice Reconciliation

Current fee records act as operational invoices. Future issued invoices should use the same checks plus invoice-number and tax checks.

| Check | Pass condition |
|---|---|
| Invoice total | Amount due minus discount equals expected billable amount. |
| Paid amount | Sum of linked payments equals `student_fee_records.amount_paid`. |
| Status | Status matches computed balance: pending, partial, paid, waived, or overdue. |
| Receipt linkage | Each payment has a receipt and each receipt points to the invoice/fee record. |
| Waiver/write-off | Waived records have explicit notes and future ledger/credit-note evidence. |
| Future tax invoice | Invoice tax snapshots reconcile to taxable value plus CGST/SGST/IGST. |

## Refund Reconciliation

Refund support is future work, but the close process should already define the expected evidence.

| Check | Pass condition |
|---|---|
| Gateway refund | Every gateway refund has one internal refund record. |
| Internal refund | Every internal refund has gateway refund ID or approved offline refund evidence. |
| Original payment | Refund links to original receipt, payment order, and invoice. |
| Amount | Refund amount does not exceed captured payment minus previous refunds. |
| Status | Gateway refund status matches internal refund status. |
| Credit note | Refunds that reduce invoice value have a credit note or ledger adjustment. |
| Audit trail | Refund request, approval, processing, webhook confirmation, and failure reason are auditable. |

## Settlement Reconciliation

| Check | Pass condition |
|---|---|
| Settlement batch | Each gateway settlement ID is imported or recorded once. |
| Gross amount | Sum of captured gateway payments in settlement matches gross internal payment total. |
| Fees and taxes | Gateway fees and gateway GST/tax are recorded separately from school fee revenue. |
| Net settlement | Gross minus gateway fees/taxes/refunds/chargebacks equals bank settlement. |
| Bank date | Settlement bank date is captured and differs from payment date only when expected. |
| Unsettled payments | Captured but unsettled payments are listed with age. |

## Failed Webhook Review

| Webhook status | Required action |
|---|---|
| `FAILED` | Review error message, replay safely after root cause is fixed, and confirm idempotency. |
| `IGNORED` | Confirm event type is intentionally unsupported or payload lacks payment entity. |
| Duplicate event | Confirm duplicate did not create extra fee payment or mutate settled records. |
| Signature failure | Treat as security signal; verify source IP/rate limit logs and do not replay untrusted payload. |
| Missing internal order | Check whether order belongs to another environment, stale test data, or gateway anomaly. |
| Amount mismatch | Block auto-capture and escalate to finance plus engineering. |

Failed webhook resolution must record owner, decision, replay command or reason not replayed, and final status.

## Ledger Reconciliation

When formal ledger entries are added, reconcile every business event:

| Event | Required ledger rows |
|---|---|
| Invoice issued | Debit receivable, credit revenue/tax payable. |
| Payment captured | Debit cash/gateway clearing, credit receivable. |
| Refund succeeded | Debit refund/receivable or revenue reversal, credit cash/gateway clearing. |
| Credit note issued | Debit revenue/tax payable, credit receivable. |
| Gateway fee posted | Debit gateway fee expense and input tax if applicable, credit gateway clearing. |
| Settlement received | Debit bank, credit gateway clearing. |

Ledger totals must balance by tenant, school, financial year, currency, and close period.

## Exception Handling

| Exception | Required handling |
|---|---|
| Captured in gateway, missing internally | Replay verified webhook or manually capture with engineering approval. |
| Internal success, missing gateway capture | Verify mock/dev mode, wrong environment, or data defect before finance close. |
| Amount mismatch | Freeze record, block receipt reissue, and reconcile with gateway evidence. |
| Duplicate receipt | Escalate immediately; receipt numbers must come from DB sequence and stay unique. |
| Partial payment mismatch | Recompute invoice balance from immutable payments and compare with stored amount paid. |
| Refund mismatch | Freeze related invoice/payment until gateway and ledger agree. |
| Cross-tenant mismatch | Treat as P0 data isolation incident. |

## Month-End Close Record

Record these in the finance close ticket:

| Field | Required evidence |
|---|---|
| Close period | Date range and timezone. |
| Scope | Tenant/school filters. |
| Gateway totals | Captured, failed, refunded, fees, taxes, settled, unsettled. |
| Internal totals | Invoices, payments, receipts, refunds, waived/write-off records. |
| Difference | Amount and count differences by category. |
| Exceptions | Owner, severity, root cause, target fix date. |
| Webhooks | Failed, ignored, duplicate, replayed, unresolved counts. |
| Settlement | Bank settlement amount and settlement IDs. |
| Approval | Finance owner and engineering owner sign-off. |

## Suggested SQL Checks

Successful payment orders without linked fee payment:

```sql
SELECT id, tenant_id, school_id, gateway_order_id, gateway_payment_id, amount_paise
FROM payment_orders
WHERE status = 'SUCCESS'
  AND fee_payment_id IS NULL;
```

Online fee payments without matching payment order:

```sql
SELECT fp.id, fp.receipt_number, fp.reference_number, fp.amount
FROM fee_payments fp
LEFT JOIN payment_orders po ON po.fee_payment_id = fp.id
WHERE fp.payment_mode = 'ONLINE'
  AND po.id IS NULL;
```

Failed gateway webhooks:

```sql
SELECT gateway, event_id, event_type, error_message, created_at, processed_at
FROM payment_gateway_events
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

Invoice/payment balance mismatches:

```sql
SELECT sfr.id,
       sfr.amount_paid AS stored_paid,
       COALESCE(SUM(fp.amount), 0) AS computed_paid
FROM student_fee_records sfr
LEFT JOIN fee_payments fp ON fp.student_fee_record_id = sfr.id
GROUP BY sfr.id, sfr.amount_paid
HAVING sfr.amount_paid <> COALESCE(SUM(fp.amount), 0);
```

## Go/No-Go

Billing reconciliation is GO only when:

1. Gateway captured totals match successful internal payment orders and fee payments.
2. Invoice or fee-record balances match immutable payment rows.
3. Refunds and credit notes reconcile to original payments and gateway evidence.
4. Settlement totals reconcile to gateway fees, taxes, refunds, and bank deposits.
5. Failed webhooks are resolved, intentionally ignored, or assigned with owner and severity.
6. Ledger records balance for the close period when the billing ledger is enabled.
7. Finance and engineering owners sign off on all exceptions.

Any cross-tenant mismatch, unexplained gateway/internal amount mismatch, duplicate receipt, duplicate gateway payment capture, or unreconciled refund is a NO-GO for close.

## Validation

TASK-046 validation command:

```bash
rg -n "billing reconciliation|payment reconciliation|settlement" docs PRODUCTION_READY_ROADMAP.md
```
