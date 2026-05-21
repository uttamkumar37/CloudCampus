# Technical Debt

## Findings From Codebase Analysis
- Mobile app is active again, but CI still has no mobile validation job.
- Transport/hostel are not standalone modules, despite being product areas in documentation requirements.
- Audit logging is implemented in important areas but should be enforced uniformly for every mutation.
- API documentation should eventually be generated from `/v3/api-docs` to avoid hand-maintained drift.
- Some API groups requested by product documentation do not cover all implemented APIs; website, subscription, staff, school setup, storage, payment, experience, and domain APIs need first-class API reference pages in a later pass.

## Do Not Fix By
- Removing tests.
- Disabling security checks.
- Moving routes to public to satisfy UI calls.
- Duplicating tenant logic in frontend.
