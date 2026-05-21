# Push Notification Flow

## Backend Support Detected
- Firebase Admin SDK dependency exists.
- Device token endpoints and repositories exist in notification/auth areas.
- Push dispatch is asynchronous through notification services.

## Expected Mobile Flow
```mermaid
sequenceDiagram
  participant App
  participant OS
  participant API
  participant Push as PushService
  participant FCM

  App->>OS: Request notification permission
  OS-->>App: Device token
  App->>API: Register token with JWT
  API->>API: Validate tenant/user context
  API-->>App: Registered
  Push->>FCM: Send notification
  FCM-->>OS: Deliver push
```

## Rules
- Device tokens are user and tenant scoped.
- Logout should revoke or deactivate the token where supported.
- Push payloads must avoid sensitive PII.
