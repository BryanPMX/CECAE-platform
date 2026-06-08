# CECAE Platform

CECAE is a React public website with a production-oriented Go + PostgreSQL
backend for event publishing and admin event management.

## Backend Status

Implemented backend pieces:

- Go REST API with structured logging and graceful shutdown.
- PostgreSQL connection pooling and versioned migrations.
- Public event endpoints for published, non-deleted events.
- Protected admin event CRUD endpoints.
- Authenticated admin event image uploads with local persistent storage.
- Admin login, JWT access tokens, opaque refresh sessions, and logout.
- Password hashing with bcrypt.
- CORS, request logging, request IDs, recovery, security headers, and login rate limiting.
- Docker image, local Compose stack, and Portainer production stack.
- One-shot migration and admin bootstrap commands.
- API-backed frontend `EventsService` adapter.
- Public event listing and detail pages with responsive image handling.
- React admin portal for event login, dashboard, listing, create, edit, and delete workflows.

Not included yet:

- Automated container integration test runner.

## Local Container Smoke Test

The local stack uses `docker-compose.yml`, builds the image locally, publishes
the API on `localhost:8080`, and publishes PostgreSQL on `localhost:5432`.

```bash
cp deploy/.env.example deploy/.env
docker compose up -d --build
docker compose --profile bootstrap run --rm \
  -e ADMIN_EMAIL=admin@cecae.org \
  -e ADMIN_PASSWORD='replace-this-local-password' \
  admin-bootstrap
curl -sS http://localhost:8080/
curl -sS http://localhost:8080/healthz
```

The root endpoint returns API metadata. `/healthz` verifies database reachability.

## Production Deployment

Use [docs/deployment-portainer-nginx.md](/Users/bryanpmx/Documents/Projects/CECAE-platform/docs/deployment-portainer-nginx.md)
for Portainer and Nginx Proxy Manager setup.

Use [docs/github-actions-image-publish.md](/Users/bryanpmx/Documents/Projects/CECAE-platform/docs/github-actions-image-publish.md)
for automated Docker Hub image publishing from GitHub Actions.

Use [docs/api-examples.md](/Users/bryanpmx/Documents/Projects/CECAE-platform/docs/api-examples.md)
for curl examples.

Use [docs/frontend-integration.md](/Users/bryanpmx/Documents/Projects/CECAE-platform/docs/frontend-integration.md)
for frontend API configuration and admin portal notes.
