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

The admin portal is available at:

- `/admin/login`
- `/admin`
- `/admin/eventos`
- `/admin/eventos/nuevo`
- `/admin/eventos/:id/editar`

It uses these backend endpoints:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/logout`
- `GET /api/admin/events`
- `GET /api/admin/events/:id`
- `POST /api/admin/events`
- `PUT /api/admin/events/:id`
- `DELETE /api/admin/events/:id`

The frontend stores the access token in React state and stores the refresh token
in local storage for reload recovery. If HTTP-only cookies are preferred later,
the backend will need a small auth transport change to issue refresh tokens as
secure cookies.

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
