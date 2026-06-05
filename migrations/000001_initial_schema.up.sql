CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email citext NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    disabled_at timestamptz,
    CONSTRAINT admin_users_email_not_empty CHECK (length(trim(email::text)) > 0),
    CONSTRAINT admin_users_password_hash_not_empty CHECK (length(trim(password_hash)) > 0)
);

CREATE TRIGGER admin_users_set_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE admin_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    refresh_token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz,
    CONSTRAINT admin_sessions_refresh_token_hash_not_empty CHECK (length(trim(refresh_token_hash)) > 0),
    CONSTRAINT admin_sessions_expiry_after_creation CHECK (expires_at > created_at)
);

CREATE INDEX admin_sessions_admin_user_id_idx
    ON admin_sessions (admin_user_id);

CREATE INDEX admin_sessions_active_expiry_idx
    ON admin_sessions (expires_at)
    WHERE revoked_at IS NULL;

CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title_es text NOT NULL,
    title_en text NOT NULL,
    description_es text NOT NULL,
    description_en text NOT NULL,
    type text NOT NULL,
    modality text NOT NULL,
    event_date date NOT NULL,
    event_time time without time zone NOT NULL,
    duration text,
    location text,
    capacity integer,
    registration_url text,
    image_url text,
    tags text[] NOT NULL DEFAULT ARRAY[]::text[],
    is_featured boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT events_title_es_not_empty CHECK (length(trim(title_es)) > 0),
    CONSTRAINT events_title_en_not_empty CHECK (length(trim(title_en)) > 0),
    CONSTRAINT events_description_es_not_empty CHECK (length(trim(description_es)) > 0),
    CONSTRAINT events_description_en_not_empty CHECK (length(trim(description_en)) > 0),
    CONSTRAINT events_type_supported CHECK (type IN ('training', 'webinar', 'talk')),
    CONSTRAINT events_modality_supported CHECK (modality IN ('presencial', 'virtual', 'hibrida')),
    CONSTRAINT events_capacity_positive CHECK (capacity IS NULL OR capacity > 0),
    CONSTRAINT events_status_supported CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT events_tags_limited CHECK (cardinality(tags) <= 20),
    CONSTRAINT events_tags_without_nulls CHECK (array_position(tags, NULL::text) IS NULL),
    CONSTRAINT events_tags_without_empty_values CHECK (array_position(tags, '') IS NULL)
);

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX events_status_deleted_at_idx
    ON events (status, deleted_at);

CREATE INDEX events_event_date_idx
    ON events (event_date);

CREATE INDEX events_published_featured_idx
    ON events (event_date)
    WHERE status = 'published'
      AND is_featured = true
      AND deleted_at IS NULL;

CREATE INDEX events_public_listing_idx
    ON events (event_date, created_at)
    WHERE status = 'published'
      AND deleted_at IS NULL;
