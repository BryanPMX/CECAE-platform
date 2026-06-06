# API Examples

Set the API base URL:

```bash
export API_BASE_URL=http://localhost:8080
```

For production:

```bash
export API_BASE_URL=https://api.cecae.org
```

## Health

```bash
curl -sS "$API_BASE_URL/"
curl -sS "$API_BASE_URL/healthz"
```

## Public Events

```bash
curl -sS "$API_BASE_URL/api/events"
curl -sS "$API_BASE_URL/api/events/featured"
curl -sS "$API_BASE_URL/api/events/EVENT_ID"
```

## Admin Login

```bash
curl -sS -X POST "$API_BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cecae.org","password":"your-password"}'
```

Save the returned access token:

```bash
export ACCESS_TOKEN=replace-with-access-token
```

## Create Event

```bash
curl -sS -X POST "$API_BASE_URL/api/admin/events" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": {"es": "Curso NOM", "en": "NOM Training"},
    "description": {"es": "Capacitacion profesional", "en": "Professional training"},
    "type": "training",
    "modality": "virtual",
    "date": "2026-07-08",
    "time": "09:30",
    "tags": ["nom", "seguridad"],
    "isFeatured": true,
    "status": "published"
  }'
```

## Update Event Status

```bash
curl -sS -X PATCH "$API_BASE_URL/api/admin/events/EVENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"draft","isFeatured":false}'
```

## Delete Event

```bash
curl -sS -X DELETE "$API_BASE_URL/api/admin/events/EVENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
