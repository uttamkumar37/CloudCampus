# Prompt Security

- Treat user input, tenant content, and retrieved documents as untrusted.
- Keep system/developer prompts outside user-editable prompt templates.
- Do not allow prompt templates to request secrets, tokens, or cross-tenant data.
- Log usage metadata, not full sensitive prompts where PII may appear.
- Rate-limit AI calls and enforce subscription/feature entitlement before provider calls.
