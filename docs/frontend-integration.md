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

## Public Event UI

The public event listing at `/eventos` uses `src/hooks/useEvents.ts` and the
API-backed `EventsService` adapter. Listing cards keep a consistent public grid
while using the shared adaptive event image component: once an image loads, the
media frame adopts the uploaded image's natural aspect ratio and renders only
that image. Square, vertical, and panoramic uploads are shown complete without a
blurred or generated background.

The event detail route at `/eventos/:id` renders the media and event content as
two separate panels: a smart image panel first, then the event details panel
below it. The detail image component reads the uploaded image's natural ratio,
adopts that ratio for the media panel, and renders only the image. This avoids
flat color or blur dead space while still showing the full image for
nonstandard ratios.

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
- `POST /api/admin/events/images`
- `GET /api/admin/events`
- `GET /api/admin/events/:id`
- `POST /api/admin/events`
- `PUT /api/admin/events/:id`
- `DELETE /api/admin/events/:id`

`POST /api/admin/events/images` accepts a multipart `image` file and requires
the same bearer token as event CRUD. The API validates the uploaded file as JPG,
PNG, or WebP, enforces the configured size limit, stores it under
`/uploads/events/...`, and returns:

```json
{
  "url": "https://api.cecae.org/uploads/events/uuid.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 123456
}
```

The admin form writes the returned `url` into the existing `imageUrl` event
field. Admins can still paste an external image URL when they prefer.

The admin event form recommends 16:9 images for consistency, but the public
listing and detail pages are resilient when uploaded images do not follow that
guideline. Admin image previews label the listing/card and detail contexts as
adaptive image surfaces.

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
