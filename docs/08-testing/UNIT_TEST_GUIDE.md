# Unit Test Guide

- Test service business rules without HTTP where possible.
- Mock repositories only when database behavior is not the point.
- Cover validation edge cases and lifecycle transitions.
- For AI prompt/embedding logic, test tenant scope and provider failure behavior.
- Keep tests deterministic; avoid current time without a clock abstraction for lifecycle logic.
