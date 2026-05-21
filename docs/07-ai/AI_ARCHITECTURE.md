# AI Architecture

CloudCampus AI is implemented under the `ai` backend package with Spring AI integrations.

## Components
- School admin AI copilot.
- Prompt templates and prompt detail management.
- Knowledge base documents.
- Embedding service and pgvector vector store.
- AI usage logs and metrics publisher.
- AI rate limiter.

```mermaid
flowchart LR
  User --> Copilot[AI Copilot API]
  Copilot --> Prompt[Prompt Templates]
  Copilot --> KB[Knowledge Base]
  KB --> Embed[Embedding Service]
  Embed --> Vector[(pgvector)]
  Copilot --> Provider[OpenAI/Anthropic]
  Copilot --> Usage[AI Usage Log]
  Usage --> Metrics[Usage Metrics Publisher]
```
