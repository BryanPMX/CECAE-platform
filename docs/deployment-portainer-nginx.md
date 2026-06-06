# Portainer And Nginx Proxy Manager Deployment

This guide deploys the CECAE backend on a self-hosted server using Portainer,
PostgreSQL, and Nginx Proxy Manager.

The production stack file is:

```text
deploy/portainer-stack.yml
```

## Production Shape

- `api`: Go API container, attached to the backend network and Nginx Proxy
  Manager network.
- `migrate`: one-shot migration container that runs before the API starts.
- `db`: private PostgreSQL container, not published to the host.
- `admin-bootstrap`: optional one-shot container to create or reset the initial
  admin user.
- `nginx-proxy-manager_default`: external network shared with your Nginx Proxy
  Manager stack.

This follows the same pattern as your CAF stack, with one important hardening
change: PostgreSQL stays private to the CECAE backend network.

## 1. Build And Publish The API Image

From your development machine or CI:

```bash
docker build -t brpmx/cecae-api:latest .
docker push brpmx/cecae-api:latest
```

If you prefer versioned deploys:

```bash
docker build -t brpmx/cecae-api:2026-06-06 .
docker push brpmx/cecae-api:2026-06-06
```

Then set `CECAE_API_IMAGE=brpmx/cecae-api:2026-06-06` in Portainer.

## 2. Confirm The Nginx Proxy Manager Network

Your CAF stack uses:

```text
nginx-proxy-manager_default
```

In Portainer:

1. Open **Networks**.
2. Confirm `nginx-proxy-manager_default` exists.
3. If your Nginx Proxy Manager stack has a different network name, update
   `deploy/portainer-stack.yml` before deploying CECAE.

## 3. Create The Portainer Stack

In Portainer:

1. Go to **Stacks**.
2. Click **Add stack**.
3. Name it `cecae`.
4. Paste the contents of `deploy/portainer-stack.yml`.
5. Add environment variables in the Portainer UI.
6. Deploy the stack.

Recommended environment variables:

```env
CECAE_API_IMAGE=brpmx/cecae-api:latest
POSTGRES_DB=cecae
POSTGRES_USER=cecae
POSTGRES_PASSWORD=replace-with-a-long-random-password

AUTH_ACCESS_TOKEN_SECRET=replace-with-64-random-characters
AUTH_REFRESH_TOKEN_SECRET=replace-with-a-different-64-random-characters
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_REFRESH_TOKEN_TTL=720h

CORS_ALLOWED_ORIGINS=https://cecae.org,https://www.cecae.org,https://admin.cecae.org
CORS_ALLOW_CREDENTIALS=true

ADMIN_EMAIL=admin@cecae.org
ADMIN_PASSWORD=replace-with-a-strong-initial-admin-password
```

Generate secrets with:

```bash
openssl rand -hex 32
```

## 4. Verify The Stack

In Portainer, check:

- `cecae-db` is healthy.
- `cecae-migrate-1` exited successfully.
- `cecae-api-1` is healthy.

The migration service is expected to exit after applying migrations.

If `migrate` fails, check its logs first. The API intentionally waits for
migrations before starting.

## 5. Create The Initial Admin

The stack includes `admin-bootstrap` as an optional one-shot service. If your
Portainer version supports Compose profiles, run the `bootstrap` profile once.

If Portainer does not expose profile controls, use one of these approaches:

- Temporarily remove the `profiles:` block from `admin-bootstrap`, redeploy,
  let it exit successfully, then add the profile back.
- Or run an equivalent one-shot command from the server:

```bash
docker run --rm \
  --network cecae_cecae_backend \
  -e APP_ENV=production \
  -e APP_NAME=cecae-api \
  -e DATABASE_URL='postgres://cecae:POSTGRES_PASSWORD@db:5432/cecae?sslmode=disable' \
  -e DATABASE_MIGRATIONS_PATH=file:///app/migrations \
  -e AUTH_ACCESS_TOKEN_SECRET='same-as-stack' \
  -e AUTH_REFRESH_TOKEN_SECRET='same-as-stack' \
  -e CORS_ALLOWED_ORIGINS='https://cecae.org,https://www.cecae.org,https://admin.cecae.org' \
  -e ADMIN_EMAIL='admin@cecae.org' \
  -e ADMIN_PASSWORD='strong-admin-password' \
  brpmx/cecae-api:latest /app/admin
```

The command is upsert-style: it creates the admin if missing, or resets the
password and clears `disabled_at` for that email.

## 6. Configure Nginx Proxy Manager

In Nginx Proxy Manager:

1. Go to **Hosts** -> **Proxy Hosts**.
2. Click **Add Proxy Host**.
3. Domain Names:
   - `api.cecae.org` or your chosen backend subdomain.
4. Scheme:
   - `http`
5. Forward Hostname / IP:
   - `cecae-api-1`
6. Forward Port:
   - `8080`
7. Enable:
   - **Block Common Exploits**
   - **Websockets Support** is optional for this API.
8. SSL tab:
   - Request a new Let's Encrypt certificate.
   - Enable **Force SSL**.
   - Enable **HTTP/2 Support**.
   - Enable **HSTS** only after you confirm HTTPS works for the domain.

After saving, test:

```bash
curl -sS https://api.cecae.org/
curl -sS https://api.cecae.org/healthz
```

Expected:

```json
{"api":"/api","health":"/healthz","service":"cecae-api","status":"ok"}
```

```json
{"status":"ok"}
```

## 7. Production Notes

- Do not publish the database port on the host.
- Keep `POSTGRES_PASSWORD`, token secrets, and admin password out of git.
- Use a versioned image tag for controlled rollbacks.
- Back up the `cecae_postgres_data` volume before upgrades.
- Re-run `migrate` on every deployment; it is safe when there are no pending
  migrations.
- Keep `CORS_ALLOWED_ORIGINS` limited to the public site and admin portal.

## 8. Backup Sketch

From the server:

```bash
docker exec cecae-db pg_dump -U cecae -d cecae > cecae-backup.sql
```

Restore into a fresh database only after confirming the target stack is stopped
or isolated:

```bash
docker exec -i cecae-db psql -U cecae -d cecae < cecae-backup.sql
```
