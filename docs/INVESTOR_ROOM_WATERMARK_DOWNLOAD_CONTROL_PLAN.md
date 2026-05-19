# Investor Room Watermark and Download Control Plan

Status: TASK-021 production-readiness plan

Last updated: 2026-05-19

## Scope

Investor rooms currently expose structured room content after link-only access or password unlock. The next production control layer is for protected downloadable assets such as pitch decks, financial models, diligence exports, product videos, cap-table summaries, and signed PDFs.

This plan defines watermarking, download policy, access event tracking, and future signed-file controls without changing the runtime API in TASK-021.

## Production Goals

1. Prevent anonymous redistribution of sensitive investor-room material.
2. Make every protected asset access attributable to a room, asset, viewer session, client IP, and policy decision.
3. Allow Super Admins to choose between view-only, watermarked download, and blocked download per asset.
4. Keep investor UX simple: valid viewers can read room content, while sensitive files require explicit policy checks.
5. Preserve an immutable trail that can support investor follow-up, abuse investigation, and compliance review.

## Watermarking Model

### Watermark Inputs

Each rendered or downloaded protected asset should include:

| Input | Source | Notes |
|---|---|---|
| Room title or room code | `platform_investor_rooms` | Avoid exposing internal UUIDs in visible marks. |
| Viewer identifier | Unlock session, invited investor email, or access-token subject | Use `Unknown viewer` only for legacy link-only rooms. |
| Timestamp | Server time | Include date and UTC time for screenshots and PDFs. |
| Client IP suffix | Request context | Show partial IP only, for example `203.0.113.x`, to reduce PII exposure. |
| Confidentiality label | Asset policy | Example: `Confidential - CloudCampus Investor Room`. |

### Rendering Requirements

| Asset type | Required watermark behavior |
|---|---|
| PDF | Add repeated diagonal faint watermark plus footer with viewer/session metadata. |
| Office document | Convert to PDF for controlled viewing; original download is disabled unless explicitly allowed. |
| Image | Render through a derivative with tiled low-opacity watermark. |
| Video | Start with visible opening slate and overlay periodic viewer/session watermark where feasible. |
| CSV/XLSX | Prefer blocked download; if allowed, include a first-row metadata banner and audit every export. |

### Storage Rules

1. Never overwrite original assets.
2. Store generated derivatives under a separate protected prefix, for example `investor-room/derived/{roomId}/{assetId}/{sessionId}/`.
3. Generated derivatives expire quickly and can be regenerated.
4. Cache keys must include asset version, viewer/session identity, policy version, and watermark template version.

## Download Policy

### Policy Levels

| Policy | Behavior | Intended use |
|---|---|---|
| `VIEW_ONLY` | In-browser rendering only; no direct object URL exposed to the browser. | Financials, customer lists, diligence summaries. |
| `WATERMARKED_DOWNLOAD` | Download allowed only through a generated watermarked derivative. | Pitch decks and generic one-pagers. |
| `ORIGINAL_DOWNLOAD` | Original file download allowed through a short-lived signed URL. | Low-sensitivity public collateral only. |
| `BLOCKED` | Asset is listed but cannot be opened or downloaded. | Temporarily restricted or under-review files. |

### Default Rules

1. New investor-room assets default to `VIEW_ONLY`.
2. `ORIGINAL_DOWNLOAD` must be an explicit Super Admin choice and should require a reason.
3. Expired rooms return no metadata or content and must not create signed file URLs.
4. Password-mode rooms require a successful unlock session before any asset-level policy is evaluated.
5. Link-only rooms may show metadata, but protected assets should still prefer `VIEW_ONLY` or `WATERMARKED_DOWNLOAD`.

### UI Requirements

| Surface | Required behavior |
|---|---|
| Public investor room | Hide browser-native download controls where possible and use controlled buttons for view/download actions. |
| Asset list | Show policy state with concise labels: `View only`, `Watermarked download`, `Download disabled`. |
| Blocked download | Explain that the owner has disabled downloads for this room or asset. |
| Super Admin builder | Allow policy selection per asset and show the current default room policy. |

## Access Event Tracking

TASK-019 already records immutable room-level events:

- `METADATA_ACCESS`
- `CONTENT_ACCESS`
- `UNLOCK_SUCCESS`
- `UNLOCK_FAILURE`
- `EXPIRED`

Download controls should extend this with asset-level events.

### Future Event Catalogue

| Event | When recorded | Required fields |
|---|---|---|
| `ASSET_VIEW_REQUESTED` | Viewer opens an asset preview. | room id/code, asset id, viewer/session id, policy, client IP. |
| `ASSET_VIEW_GRANTED` | Controlled preview is served. | derivative id or render token, policy, watermark version. |
| `ASSET_VIEW_DENIED` | Preview blocked by expiry, policy, or failed auth. | denial reason and policy. |
| `DOWNLOAD_REQUESTED` | Viewer clicks a download action. | room id/code, asset id, viewer/session id, requested format. |
| `DOWNLOAD_GRANTED` | Signed derivative or original URL is issued. | signed URL expiry, policy, watermark version. |
| `DOWNLOAD_DENIED` | Download blocked by policy, expiry, auth, or rate limit. | denial reason and policy. |
| `WATERMARK_GENERATED` | Server creates a watermarked derivative. | derivative id, asset version, template version. |
| `SIGNED_URL_ISSUED` | Storage URL is minted. | object key hash, expiry, policy, requester. |
| `ASSET_POLICY_CHANGED` | Super Admin changes asset policy. | actor id, old policy, new policy, reason. |

### Audit Requirements

1. Asset-level access logs must be immutable and should not have foreign-key cascade deletes.
2. Store room code, room id, asset id, event, policy, denial reason, actor/viewer/session id, client IP, user agent hash, and occurred-at timestamp.
3. Keep original object keys out of public responses and use hashed object-key references in audit logs.
4. Include correlation ID when available so download attempts can be traced through API logs.
5. Rate-limit repeated denied download attempts and record both the denial and the rate-limit trigger.

## Future Signed-File Controls

### API Shape

Future protected assets should avoid exposing object storage paths directly. A controlled API should:

1. Validate room status and expiry.
2. Validate password unlock or viewer token.
3. Load asset policy and room default policy.
4. Record `DOWNLOAD_REQUESTED` or `ASSET_VIEW_REQUESTED`.
5. Generate a watermarked derivative if required.
6. Mint a short-lived signed URL only after policy approval.
7. Record `DOWNLOAD_GRANTED`, `DOWNLOAD_DENIED`, `ASSET_VIEW_GRANTED`, or `ASSET_VIEW_DENIED`.

Recommended endpoints:

```text
GET  /v1/experience/public/investor/{roomCode}/assets/{assetId}/view
POST /v1/experience/public/investor/{roomCode}/assets/{assetId}/download
PATCH /v1/super-admin/experience/investor-rooms/{roomId}/assets/{assetId}/policy
```

### Signed URL Requirements

| Control | Requirement |
|---|---|
| Expiry | Default 5 minutes for downloads, 2 minutes for previews. |
| Scope | URL must target one object key and one response disposition. |
| Format | Watermarked derivative unless policy is `ORIGINAL_DOWNLOAD`. |
| Revocation | Expired room, archived room, or blocked asset policy must stop issuing new URLs. |
| Headers | Force `Content-Disposition` from policy; never trust client-provided filenames. |
| Logging | Every issued URL has an immutable `SIGNED_URL_ISSUED` event. |

## Data Model Additions

Future migrations should introduce separate asset and access tables.

```text
investor_room_assets
- id
- room_id
- title
- asset_type
- original_object_key
- file_size_bytes
- content_hash
- download_policy
- watermark_required
- status
- created_by
- created_at
- updated_at

investor_room_asset_access_log
- id
- room_id
- room_code
- asset_id
- event
- download_policy
- viewer_session_id
- actor_id
- client_ip
- user_agent_hash
- correlation_id
- denial_reason
- signed_url_expires_at
- object_key_hash
- occurred_at
```

## Rollout Plan

1. Add asset metadata model and Super Admin upload/policy editor.
2. Add immutable asset access log and repository queries for security review.
3. Add view/download policy checks in the public investor-room API.
4. Add server-side PDF watermark generation for `WATERMARKED_DOWNLOAD`.
5. Add short-lived signed URL generation for approved derivative downloads.
6. Add frontend asset list controls and disabled states.
7. Add regression tests for expired rooms, password failures, blocked downloads, and policy changes.

## Acceptance Mapping

| TASK-021 requirement | Plan coverage |
|---|---|
| Watermarking | Defines visible watermark inputs, asset-specific rendering, derivative storage, and generation events. |
| Download policy | Defines `VIEW_ONLY`, `WATERMARKED_DOWNLOAD`, `ORIGINAL_DOWNLOAD`, and `BLOCKED` policy levels. |
| Access event tracking | Extends TASK-019 room-level audit events with asset-level view, download, signed URL, and policy-change events. |
| Future signed-file controls | Defines controlled endpoints, short-lived signed URLs, URL scope, expiry, revocation, and logging requirements. |

