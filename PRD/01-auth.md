# Authentication Requirements

## Overview

Taskflow uses **httpOnly session cookies** for authentication. The cookie is set on the shared apex domain so every MFE zone (shell, tasks, board) receives it automatically — no token passing between apps required.

**Form implementation**: All auth forms use **Formik + Yup**. `noValidate` on the `<form>` element disables browser-native validation. Field errors render inline below each input only after the field is touched. Server errors use `formik.setStatus()` and render as a banner above the submit button.

---

## User Stories

| # | Story |
|---|---|
| US-AUTH-1 | As a new user I can sign up with my name, email, designation, and password |
| US-AUTH-2 | As a returning user I can log in with email and password |
| US-AUTH-3 | As a logged-in user my session persists across page refreshes |
| US-AUTH-4 | As a logged-in user I can log out and my session is cleared |
| US-AUTH-5 | As an unauthenticated user I am redirected to login if I try to access a protected route |

---

## Signup Flow

```
User fills name + email + designation + password
          │
          ▼
POST /api/auth/signup
          │
      ┌───┴───┐
      │ Valid │ → 201 Created
      │       │   Set-Cookie: taskflow_session=<token>; Path=/; HttpOnly; SameSite=Lax
      │       │   Set-Cookie: taskflow_name=<name>; Path=/; SameSite=Lax
      │       │   Set-Cookie: taskflow_email=<email>; Path=/; SameSite=Lax
      │       │   Set-Cookie: taskflow_title=<title>; Path=/; SameSite=Lax
      │       │   → redirect to /
      └───────┘
          │
      ┌───┴──────┐
      │ Invalid  │ → 422 Unprocessable
      │          │   Response: { ok: false, errors: [...] }
      │          │   → inline errors, no redirect
      └──────────┘
```

### Designation field

A **React Select** dropdown (dark-themed via `lib/selectStyles.ts`). Selecting "Other" reveals a free-text input.

**Allowed values**: Engineer · Designer · Product Manager · QA Engineer · DevOps · Team Lead · Manager · Director · Founder · Other

When "Other" is selected: the free-text value is sent as `title`. The dropdown value `"Other"` is never persisted.

---

## Login Flow

```
User submits email + password
        │
        ▼
POST /api/auth/login
        │
    ┌───┴───┐
    │ Valid │ → 200 OK  +  Set-Cookie: taskflow_session + taskflow_name + taskflow_email
    │       │   → redirect to /
    └───────┘
        │
    ┌───┴──────┐
    │ Invalid  │ → 401  →  banner error, no redirect
    └──────────┘
```

---

## Cookie Spec

| Cookie | HttpOnly | Readable by JS | Purpose |
|---|---|---|---|
| `taskflow_session` | `true` | No | Session token — auth gating |
| `taskflow_name` | `false` | Yes | Display name in Sidebar / Topbar |
| `taskflow_email` | `false` | Yes | Display email in Sidebar / Topbar |
| `taskflow_title` | `false` | Yes | Designation — shown in People listing |

All cookies: `Path=/; SameSite=Lax; Secure=true (production)`.  
`taskflow_session` expires in 7 days (sliding). Client-readable cookies expire with the session.

---

## Protected Routes

All routes except `/login`, `/signup`, and `/api/auth/login` + `/api/auth/signup` require a valid session. Unauthenticated requests → redirect to `/login?redirect=<original-path>`.

---

## API Endpoints

### `POST /api/auth/signup`

**Request**
```json
{
  "name": "Arkabrata Das",
  "email": "arko@example.com",
  "password": "hunter2",
  "title": "Engineer"
}
```
`title` is optional. When the user selected "Other" on the form, the free-text value is sent here — never the string `"Other"`.

**Success (201)**
```json
{ "ok": true, "user": { "id": "uuid", "name": "Arkabrata Das", "email": "arko@example.com", "title": "Engineer" } }
```
Sets `taskflow_session` (httpOnly) + `taskflow_name` + `taskflow_email` + `taskflow_title` cookies.

**Failure (422)**
```json
{ "ok": false, "errors": [{ "field": "email", "code": "DUPLICATE", "message": "An account with this email already exists." }] }
```

---

### `POST /api/auth/login`

**Request**
```json
{ "email": "user@example.com", "password": "hunter2" }
```

**Success (200)**
```json
{ "ok": true, "user": { "id": "uuid", "name": "Arkabrata C.", "email": "user@example.com", "title": "Engineer" } }
```

**Failure (401)**
```json
{ "ok": false, "message": "Invalid email or password" }
```

---

### `POST /api/auth/logout`

**Success (200)** — clears all session cookies.
```json
{ "ok": true }
```

---

### `GET /api/auth/me`

**Success (200)**
```json
{
  "id": "uuid",
  "name": "Arkabrata C.",
  "email": "user@example.com",
  "title": "Engineer",
  "avatarInitials": "AC"
}
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `name` | Required, min 2 characters |
| `email` | Required, valid email format |
| `password` | Required, min 6 characters |
| `title` | Optional. If "Other" selected: custom text required, min 2 characters |

---

## Cross-Zone Authentication

All MFE apps run on the same domain proxied through the Cloudflare Worker. The browser automatically sends `taskflow_session` to every zone.

```
localhost:8787/        → Shell     → reads cookie
localhost:8787/tasks   → Task MFE  → same cookie
localhost:8787/board   → Board MFE → same cookie
```

---

## Current Stub (Phase 0)

`shell/app/api/auth/login/route.ts` and `shell/app/api/auth/signup/route.ts` validate inputs and set real cookies (no DB). Replace `password_hash` logic and add DB writes when the User Service is built.

---

## Out of Scope

- OAuth / SSO (Google, GitHub)
- Two-factor authentication
- Password reset / forgot password
- Email verification on signup
- Refresh token rotation
