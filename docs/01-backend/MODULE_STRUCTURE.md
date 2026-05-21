# Backend Module Structure

## Detected Packages
- `ai`
- `assignment`
- `attendance`
- `audit`
- `auth`
- `common`
- `config`
- `demo`
- `domain`
- `exam`
- `experience`
- `feature`
- `finance`
- `homework`
- `leave`
- `lessonplan`
- `mobile`
- `notice`
- `notification`
- `onlineclass`
- `payment`
- `reports`
- `retention`
- `school`
- `security`
- `staff`
- `staffattendance`
- `storage`
- `student`
- `subscription`
- `teacher`
- `tenant`
- `timetable`
- `video`
- `website`
- `whatsapp`


## Controller/Service/Repository Pattern
- Controllers live in `<module>/controller` and expose `/v1/...` routes.
- DTOs live in `<module>/dto` or nested request/response packages.
- Services own validation and workflow orchestration.
- Repositories expose tenant-scoped persistence operations.
- Entities carry `tenantId` where records are tenant-owned.

## High-Change Modules
- `student`: lifecycle, Profile 360, documents, parent links.
- `school`: academic setup and school access.
- `finance`/`payment`: fees, invoices, Razorpay.
- `experience`/`website`: public website and DSEP platform.
- `ai`: prompts, knowledge, embeddings, usage.
- `auth`: JWT, lockout, refresh rotation, device sessions.
