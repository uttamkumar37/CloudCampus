<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Background Jobs

Status: CURRENT_IMPLEMENTED

| Job/process | Files/tables | Status | Notes |
| --- | --- | --- | --- |
| Report export worker | SuperAdminReportExportWorker/Processor, report_export_jobs/files, bulk_jobs. | CURRENT_IMPLEMENTED | Async export foundation. |
| Bulk jobs | BulkJobService/Controller, bulk_jobs. | CURRENT_IMPLEMENTED | Imports/report jobs. |
| Student import | StudentImportJob/service. | CURRENT_IMPLEMENTED | Queue/import validation. |
| Transactional outbox | TransactionalOutboxService, outbox_events. | CURRENT_IMPLEMENTED | Delivery/retry infrastructure. |
| Stats recalculation | platform_stats, tenant_stats, school_stats. | CURRENT_IMPLEMENTED | Scale summaries. |
| Notification retry | Notification/outbox records; scheduler exact behavior needs verification. | CURRENT_PARTIAL | Review runtime workers. |
| AI automation run execution | AutomationRun model exists; scheduler/worker behavior should be verified. | CURRENT_PARTIAL | Review automation workers. |
