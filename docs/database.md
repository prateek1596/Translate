# Database Schema

The MVP uses PostgreSQL because it is the simplest production-ready option for a transaction-safe translation app with future analytics.

## Tables

### `User`

Stores optional identity and language preferences.

### `TranslationSession`

Represents a speaking session. A session belongs to a user when auth is added later, but it can also remain anonymous.

The translate endpoint creates a new session automatically when no `sessionId` is supplied and reuses the same row for later speech segments.

### `TranslationMessage`

Stores each translated segment with provider metadata and latency for observability.

## Why this model scales

- Sessions are append-only, which makes auditing and replay cheap.
- Messages are indexed by session and creation time for fast pagination.
- Language preferences live on the user row for quick startup defaults.
- The schema is compatible with multi-tenant auth later without a rewrite.