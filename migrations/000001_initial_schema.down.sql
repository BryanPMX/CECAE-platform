DROP INDEX IF EXISTS events_public_listing_idx;
DROP INDEX IF EXISTS events_published_featured_idx;
DROP INDEX IF EXISTS events_event_date_idx;
DROP INDEX IF EXISTS events_status_deleted_at_idx;

DROP TRIGGER IF EXISTS events_set_updated_at ON events;
DROP TABLE IF EXISTS events;

DROP INDEX IF EXISTS admin_sessions_active_expiry_idx;
DROP INDEX IF EXISTS admin_sessions_admin_user_id_idx;
DROP TABLE IF EXISTS admin_sessions;

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON admin_users;
DROP TABLE IF EXISTS admin_users;

DROP FUNCTION IF EXISTS set_updated_at();
