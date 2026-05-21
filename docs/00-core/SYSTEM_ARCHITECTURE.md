# System Architecture

## High-Level Topology

```mermaid
flowchart LR
  Browser[React Web App] --> API[Spring Boot API]
  Mobile[Expo Mobile App] --> API
  API --> PG[(PostgreSQL + pgvector)]
  API --> Redis[(Redis)]
  API --> Rabbit[(RabbitMQ)]
  API --> MinIO[(MinIO Object Storage)]
  API --> Razorpay[Razorpay]
  API --> AI[OpenAI/Anthropic via Spring AI]
  Rabbit --> Workers[Notification and Experience Consumers]
  API --> Metrics[Actuator + Prometheus]
  Metrics --> Grafana[Grafana]
  API --> Tempo[OpenTelemetry/Tempo]
```

## Request Flow

```mermaid
sequenceDiagram
  participant Client
  participant Security as SecurityFilterChain
  participant JWT as JwtAuthenticationFilter
  participant Context as RequestContext
  participant Controller
  participant Service
  participant Repo
  participant DB as PostgreSQL

  Client->>Security: HTTPS request + Bearer token
  Security->>JWT: Validate token and authorities
  JWT->>Context: Set userId, tenantId, schoolId
  Security->>Controller: Apply route/method RBAC
  Controller->>Service: Validate request intent
  Service->>Repo: Tenant-scoped query
  Repo->>DB: SQL with tenant ownership
  DB-->>Repo: Rows
  Repo-->>Service: Entities
  Service-->>Controller: DTO
  Controller-->>Client: ApiResponse<T>
```

## Architectural Boundaries
- Backend controllers are thin and role-aware; services own business rules and cross-entity validation.
- Repositories must preserve tenant ownership in every read/write path.
- Frontend route guards improve UX but never replace backend RBAC.
- Mobile uses the same backend API contract as web and stores sessions through secure storage/localStorage fallback.
- Async work uses named executors or RabbitMQ; async code must preserve `RequestContext` when tenant data is touched.
