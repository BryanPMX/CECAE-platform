# Frontend Integration Notes

The backend now supports the public event contract used by the React app.

## Public Adapter

Add a Vite environment variable:

```env
VITE_API_BASE_URL=https://api.cecae.org
```

Local development can use:

```env
VITE_API_BASE_URL=http://localhost:8080
```

The public frontend should call:

- `GET /api/events`
- `GET /api/events/featured`
- `GET /api/events/:id`

Only published, non-deleted events are returned publicly.

## Admin Portal

The admin portal is not built yet. The backend is ready for:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/logout`
- Protected admin event CRUD endpoints.

For the first admin portal version, prefer storing the access token in memory
and the refresh token in a secure storage strategy chosen during frontend
implementation. If cookies are preferred, the backend will need a small auth
transport change to issue refresh tokens as secure HTTP-only cookies.

## Event Response Shape

Public responses preserve:

```ts
interface CecaeEvent {
  id: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
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
  isFeatured: boolean;
}
```
