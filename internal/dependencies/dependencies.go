//go:build deps

// Package dependencies anchors the planned backend dependency baseline until
// implementation packages import these libraries directly.
package dependencies

import (
	_ "github.com/caarlos0/env/v11"
	_ "github.com/go-chi/chi/v5"
	_ "github.com/go-chi/cors"
	_ "github.com/go-playground/validator/v10"
	_ "github.com/golang-jwt/jwt/v5"
	_ "github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv"
	_ "github.com/stretchr/testify/require"
	_ "golang.org/x/crypto/bcrypt"
)
