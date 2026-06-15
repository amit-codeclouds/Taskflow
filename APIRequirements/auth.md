# Auth Contract

## Mechanism

Cookie-based session. The Shell sets one `httpOnly` cookie on the shared domain.
All zones (Task MFE, Board MFE) automatically receive it on every request — no
`postMessage`, no token passing, no SDK.

---

## Cookie spec

Four cookies are set on successful login or signup:

| Cookie | HttpOnly | JS-readable | Purpose |
|---|---|---|---|
| `taskflow_session` | `true` | No | Session token — auth gating across all zones |
| `taskflow_name` | `false` | Yes | Display name — Sidebar workspace indicator + user card |
| `taskflow_email` | `false` | Yes | Email — Sidebar user card |
| `taskflow_title` | `false` | Yes | Designation — People listing, Settings profile |

All cookies: `Path=/; SameSite=Lax; Secure=true (production); Domain=.taskflow.app`

`taskflow_session` Max-Age: `604800` (7 days, sliding). Client-readable cookies share the same expiry.

---

## Login flow

```
Browser → POST /api/auth/login (email + password)
         ← 200 + Set-Cookie: taskflow_session=...
         ← { user: { id, name, email, avatarInitials } }
```

All subsequent requests carry the cookie automatically.

---

## Session verification (microservice pattern)

Each service validates the cookie by calling the Auth Service internally:
```
Task Service → GET /api/auth/verify   (internal, not exposed to browser)
              Cookie header forwarded
             ← 200 { userId, email } | 401
```

Or use a shared JWT secret — each service verifies the token locally without
a network call.

---

## Logout flow

```
Browser → POST /api/auth/logout
         ← 200 + Set-Cookie: taskflow_session=; Max-Age=0
```

---

## Current Implementation (Phase 0)

`shell/app/api/auth/login/route.ts` and `shell/app/api/auth/signup/route.ts` validate inputs and set all four cookies with real values (no DB — stub session token). Forms use **Formik + Yup** with field-level inline errors. Replace session token generation and add DB writes when the User Service is built.
