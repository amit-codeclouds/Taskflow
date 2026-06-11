# Taskflow — API Requirements

> Single source of truth for every API contract, database schema, and data model
> needed to match the frontend as it evolves.
>
> **No backend exists yet.** This folder is spec-first: write what the frontend
> needs here so the backend team has a complete contract when they start.

---

## Index

| File | Contents |
|---|---|
| [models.md](./models.md) | TypeScript-style interfaces for every entity |
| [database-schema.md](./database-schema.md) | PostgreSQL DDL + MongoDB collection specs |
| [api-endpoints.md](./api-endpoints.md) | REST endpoint catalogue (method, path, body, response) |
| [auth.md](./auth.md) | Session / cookie auth contract |

---

## Microservice → Database Assignment

Two databases, split by data character:

### PostgreSQL — structured, relational, transactional

Use for everything that has **strict shape, foreign-key integrity, or needs
ACID transactions**:

| Service | Tables |
|---|---|
| **Task Service** | `tasks`, `labels`, `task_labels` |
| **User Service** | `users`, `team_members` |
| **Project Service** | `projects`, `sprints`, `sprint_tasks` |
| **Comment Service** | `comments` |

**Why PostgreSQL here:**
Tasks have well-defined columns (status, priority, due date, assignee).
Cross-table queries are common (`tasks JOIN users JOIN sprints`).
Status transitions benefit from row-level locking.
Due dates and ordering are SQL-native.

---

### MongoDB Atlas — flexible, document-oriented, schema-optional

Use for everything that has **variable shape, high write volume, or append-only
log semantics**:

| Service | Collections |
|---|---|
| **Activity Service** | `activity_logs` |
| **Notification Service** | `notifications` |
| **User Preferences Service** | `user_preferences` |
| **Audit Service** | `audit_trail` |

**Why MongoDB here:**
Activity logs grow unboundedly and are never joined — time-series reads by
`userId` or `taskId` only.
User preferences are a heterogeneous blob (theme, filters, sidebar state) with
no fixed schema — they change per feature sprint.
Notifications embed rich metadata (different payload shape per notification
type) — a JSONB column in Postgres would work but a document store is cleaner.

---

## Decision rule (quick reference)

> **If you're adding a new service, ask:**
> - Does it have foreign keys to users or tasks? → **PostgreSQL**
> - Is it an append-only event stream, or a per-user settings bag? → **MongoDB**
> - Does it need a transaction that spans multiple entities? → **PostgreSQL**
