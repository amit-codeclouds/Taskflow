# Authentication Requirements

## Overview

Taskflow uses **httpOnly session cookies** for authentication. The cookie is set on the shared apex domain so every MFE zone (shell, tasks, board) receives it automatically on every request — no token passing between apps required.

---

## User Stories

| # | Story |
|---|---|
| US-AUTH-1 | As a new user I can sign up with my email and password |
| US-AUTH-2 | As a returning user I can log in with email and password |
| US-AUTH-3 | As a logged-in user my session persists across page refreshes |
| US-AUTH-4 | As a logged-in user I can log out and my session is cleared |
| US-AUTH-5 | As an unauthenticated user I am redirected to login if I try to access a protected route |

---

## Login Flow

```
User submits email + password
        │
        ▼
POST /api/auth/login
        │
    ┌───┴───┐
    │ Valid │ → 200 OK
    │       │   Set-Cookie: taskflow_session=<token>; Path=/; HttpOnly; SameSite=Lax
    │       │   Response: { ok: true, user: { id, name, email } }
    │       │   → redirect to /
    └───────┘
        │
    ┌───┴──────┐
    │ Invalid  │ → 401 Unauthorized
    │          │   Response: { ok: false, message: "Invalid credentials" }
    │          │   → inline error, no redirect
    └──────────┘
```

---

## Session Cookie Spec

| Attribute | Value | Reason |
|---|---|---|
| Name | `taskflow_session` | Consistent identifier across all zones |
| Path | `/` | Sent on all requests to the domain |
| HttpOnly | `true` | Not readable by JavaScript — prevents XSS token theft |
| SameSite | `Lax` | Blocks cross-site POST forgery; allows GET navigation |
| Secure | `true` (production) | HTTPS only in production |
| Domain | apex domain | Shared across all MFE subdomains / zones |
| Expiry | 7 days (sliding) | Renewed on each authenticated request |

---

## Current Implementation (Phase 0 Stub)

**File**: `shell/src/app/api/auth/route.ts`

```ts
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'taskflow_session=stub; Path=/; HttpOnly; SameSite=Lax',
    },
  });
}
```

This stub always returns success and sets a hardcoded cookie. No credential validation yet.

---

## Protected Routes

All routes except `/login` and `/api/auth/login` require a valid session cookie.

| Route | Auth required |
|---|---|
| `GET /` | Yes |
| `GET /tasks` | Yes |
| `GET /board` | Yes |
| `GET /people` | Yes |
| `GET /teams` | Yes |
| `GET /settings` | Yes |
| `GET /api/auth/me` | Yes |
| `POST /api/auth/login` | No |
| `POST /api/auth/logout` | Yes |

Unauthenticated requests to protected routes → redirect to `/login?redirect=<original-path>`.

---

## API Endpoints

### `POST /api/auth/login`

**Request**
```json
{
  "email": "user@example.com",
  "password": "hunter2"
}
```

**Success (200)**
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "name": "Arkabrata C.",
    "email": "user@example.com"
  }
}
```

**Failure (401)**
```json
{
  "ok": false,
  "message": "Invalid email or password"
}
```

---

### `POST /api/auth/logout`

Requires cookie. Clears the session server-side and expires the cookie.

**Success (200)**
```json
{ "ok": true }
```

---

### `GET /api/auth/me`

Returns the currently authenticated user.

**Success (200)**
```json
{
  "id": "uuid",
  "name": "Arkabrata C.",
  "email": "user@example.com",
  "avatarInitials": "AC"
}
```

**Unauthenticated (401)**
```json
{ "ok": false, "message": "Not authenticated" }
```

---

## Cross-Zone Authentication

Because all MFE apps run on the same domain (proxied through the Cloudflare Worker), the browser automatically sends the `taskflow_session` cookie to every zone:

```
localhost:8787/        → Shell  → reads cookie
localhost:8787/tasks   → Task MFE → same cookie
localhost:8787/board   → Board MFE → same cookie
```

No token passing via `postMessage`, `localStorage`, or URL parameters. The cookie IS the auth mechanism.

---

## Validation Rules

| Field | Rule |
|---|---|
| email | Required, valid email format |
| password | Required, min 8 characters |

---

## Out of Scope

- OAuth / SSO (Google, GitHub)
- Two-factor authentication
- Password reset flow
- Email verification on signup
- Refresh token rotation
