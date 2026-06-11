# Auth Contract

## Mechanism

Cookie-based session. The Shell sets one `httpOnly` cookie on the shared domain.
All zones (Task MFE, Board MFE) automatically receive it on every request — no
`postMessage`, no token passing, no SDK.

---

## Cookie spec

| Field | Value |
|---|---|
| Name | `taskflow_session` |
| Value | Signed JWT or opaque token (Auth Service decides) |
| Path | `/` |
| HttpOnly | `true` |
| SameSite | `Lax` |
| Secure | `true` in production |
| Domain | `.taskflow.app` (shared across all subdomains) |
| Max-Age | `604800` (7 days) |

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

## Current stub (Phase 0)

`shell/src/app/api/auth/route.ts` returns a hardcoded stub cookie:
```ts
'Set-Cookie': 'taskflow_session=stub; Path=/; HttpOnly; SameSite=Lax'
```
Replace with real auth when the User Service is built.
