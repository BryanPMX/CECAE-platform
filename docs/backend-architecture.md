# CECAE V2 Backend Architecture

This backend will provide the production REST API for CECAE events administration.
It is designed as a Go service backed by PostgreSQL and deployed with Docker
Compose through Portainer.

## Initial Scope

- One administrative user.
- No public registration.
- Secure admin authentication with access and refresh tokens.
- Public read-only event endpoints for published, non-deleted events.
- Protected admin CRUD endpoints for all event states.
- Soft deletes for events.
- Frontend-compatible event response contract.

## Project Tree

```text
cmd/
  api/
    main.go                 # API process entrypoint and graceful shutdown
internal/
  config/                   # Environment loading, validation, typed settings
  domain/                   # Core entities, value objects, domain errors
  application/              # Auth and event use cases / service layer
  repository/               # Persistence interfaces and PostgreSQL adapters
  transport/
    http/                   # Router, handlers, DTOs, response mapping
  middleware/               # Auth, CORS, logging, recovery, rate limiting
  security/                 # Password hashing, JWT, refresh-token utilities
  database/                 # PostgreSQL connection and migration helpers
  logger/                   # Structured JSON logger construction
  dependencies/             # Build-tagged dependency baseline anchor
migrations/                 # Versioned PostgreSQL schema migrations
deploy/                     # Dockerfile, compose stack, env examples
docs/                       # Backend architecture and operations notes
```

## Implementation Status

- Milestone 1 is complete: the backend ownership boundaries and tracked project
  directories are in place.
- Milestone 2 is complete: the repository has a root Go module, a pinned
  dependency lockfile, and a build-tagged dependency anchor.
- Runtime backend packages are not implemented yet; `cmd/api` and the main
  internal packages remain intentionally empty until Milestone 3 starts.

## Boundary Rules

- HTTP handlers translate requests and responses only.
- Application services own business workflows.
- Repositories hide PostgreSQL details behind interfaces.
- Domain types do not depend on transport or database packages.
- Security primitives are isolated from handlers and repositories.
- Configuration is loaded once at startup and passed through dependency
  injection.

## REST Surface

Public:

- `GET /healthz`
- `GET /api/events`
- `GET /api/events/featured`
- `GET /api/events/:id`

Admin:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/logout`
- `GET /api/admin/events`
- `GET /api/admin/events/:id`
- `POST /api/admin/events`
- `PUT /api/admin/events/:id`
- `PATCH /api/admin/events/:id`
- `DELETE /api/admin/events/:id`

## Event Contract

Public event responses preserve the frontend `CecaeEvent` shape:

```ts
type LocalizedText = {
  es: string;
  en: string;
};

interface CecaeEvent {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: 'training' | 'webinar' | 'talk';
  modality: 'presencial' | 'virtual' | 'hibrida';
  date: string;
  time: string;
  duration?: string;
  location?: string;
  capacity?: number;
  registrationUrl?: string;
  imageUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
}
```

Admin responses may additionally include:

- `status`
- `createdAt`
- `updatedAt`
- `deletedAt`

## Dependency Baseline

The Go module is rooted at `github.com/BryanPMX/CECAE-platform` and starts with
these backend dependencies:

- `github.com/go-chi/chi/v5` for the HTTP router and middleware chain.
- `github.com/go-chi/cors` for explicit frontend/API CORS policy.
- `github.com/jackc/pgx/v5` for PostgreSQL pooling and queries.
- `github.com/golang-migrate/migrate/v4` for versioned database migrations.
- `github.com/caarlos0/env/v11` and `github.com/joho/godotenv` for typed
  configuration loading across local and deployed environments.
- `github.com/go-playground/validator/v10` for request DTO validation.
- `github.com/golang-jwt/jwt/v5` and `golang.org/x/crypto` for access tokens,
  refresh-token helpers, and password hashing.
- `github.com/google/uuid` for stable entity identifiers.
- `github.com/stretchr/testify` for focused unit and integration test
  assertions.

The build-tagged package in `internal/dependencies` anchors this baseline until
the implementation packages import each dependency directly.

## Planned Milestones

1. Architecture and tracked project structure. Complete.
2. Go module and dependency baseline. Complete.
3. Configuration loading and validation.
4. Logger, database connection, and graceful API bootstrap.
5. Domain models, DTOs, validation, and centralized errors.
6. PostgreSQL migrations.
7. Event repository and service layer.
8. Auth security, admin sessions, and middleware.
9. Public and admin HTTP handlers.
10. Docker, Portainer compose stack, and deployment docs.
