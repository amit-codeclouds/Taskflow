# Shell — API Requirements

> **Scope:** Auth session management, current-user resolution, and team management.
> All requests pass through the Cloudflare Worker at `/api/*` → Gateway.
> Auth is cookie-based (`taskflow_session`). Cookie is set on the root domain so all zones share it.

---

## Base

| Item | Value |
|------|-------|
| Prefixes | `/api/auth`, `/api/teams` |
| Auth mechanism | `HttpOnly` cookie — `taskflow_session` |
| Content-Type | `application/json` |

---

## Endpoints

### POST /api/auth/login

Authenticate a user and set the session cookie.

**Auth required:** No

**Request body**
```json
{
  "email": "string",       // required
  "password": "string"     // required
}
```

**Response — 200 OK**
```json
{
  "ok": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string | null",
    "role": "string"
  }
}
```

**Response — 401 Unauthorized**
```json
{
  "ok": false,
  "error": "Invalid credentials"
}
```

**Set-Cookie header on success**
```
taskflow_session=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

**Notes**
- Cookie is set on the root domain, not a subdomain, so all MFE zones inherit it automatically.
- `Max-Age` = 7 days. Refresh on activity is handled server-side.

---

### POST /api/auth/logout

Invalidate the session and clear the cookie.

**Auth required:** Yes (cookie)

**Request body:** None

**Response — 200 OK**
```json
{
  "ok": true
}
```

**Set-Cookie on response (clears cookie)**
```
taskflow_session=; Path=/; HttpOnly; Max-Age=0
```

---

### GET /api/auth/me

Return the currently authenticated user from the session cookie.

**Auth required:** Yes (cookie)

**Response — 200 OK**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "admin | member | viewer"
}
```

**Response — 401 Unauthorized**
```json
{
  "ok": false,
  "error": "Not authenticated"
}
```

**Notes**
- Shell calls this on mount to hydrate the nav bar (avatar, name).
- All MFE zones can call this endpoint since the cookie is shared.

---

### PATCH /api/auth/me

Update the current user's profile.

**Auth required:** Yes (cookie)

**Request body** (all fields optional)
```json
{
  "name": "string",
  "avatar": "string | null"
}
```

**Response — 200 OK**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "string"
}
```

---

---

## Teams endpoints

### GET /api/teams

List all teams the current user belongs to.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "teams": [
    {
      "id": "team_abc",
      "name": "Taskflow Core",
      "description": "Engineering team building the core platform.",
      "color": "#6155DD",
      "memberCount": 3,
      "pendingInvites": 1,
      "role": "admin | member"
    }
  ]
}
```

---

### POST /api/teams

Create a new team. The creator is automatically added as admin.

**Auth required:** Yes

**Request body**
```json
{
  "name":        "string",        // required
  "description": "string | null"  // optional
}
```

**Response — 201 Created**
```json
{
  "id": "team_abc",
  "name": "Frontend Team",
  "description": null,
  "color": "#6155DD",
  "memberCount": 1,
  "pendingInvites": 0,
  "role": "admin"
}
```

---

### GET /api/teams/:teamId

Get a team with its full member list.

**Auth required:** Yes (must be a member)

**Response — 200 OK**
```json
{
  "id": "team_abc",
  "name": "Taskflow Core",
  "description": "Engineering team building the core platform.",
  "color": "#6155DD",
  "members": [
    {
      "id": "usr_abc",
      "name": "Arkabrata",
      "email": "arkabrata@codeclouds.com",
      "avatar": null,
      "role": "admin"
    }
  ],
  "pendingInvites": [
    {
      "email": "newmember@example.com",
      "invitedAt": "2026-06-11T08:00:00Z"
    }
  ]
}
```

---

### PATCH /api/teams/:teamId

Update team name or description. Admin only.

**Auth required:** Yes (admin)

**Request body** (all optional)
```json
{
  "name":        "string",
  "description": "string | null"
}
```

**Response — 200 OK** — updated team object

---

### DELETE /api/teams/:teamId

Delete a team permanently. Admin only.

**Auth required:** Yes (admin)

**Response — 204 No Content**

---

### POST /api/teams/:teamId/invites

Send an email invitation to join the team.

**Auth required:** Yes (admin or member, depending on team settings)

**Request body**
```json
{
  "email": "string"   // required — recipient email address
}
```

**Response — 200 OK**
```json
{
  "ok": true,
  "email": "colleague@example.com",
  "invitedAt": "2026-06-11T09:00:00Z"
}
```

**Response — 409 Conflict** (already a member or already invited)
```json
{
  "error": "This email has already been invited or is already a member."
}
```

**Notes**
- Backend sends a transactional email with a time-limited invite link.
- Invite token expires after 7 days.
- Accepting the invite creates the user account if it does not exist.

---

### DELETE /api/teams/:teamId/invites/:email

Cancel a pending invite.

**Auth required:** Yes (admin)

**Response — 204 No Content**

---

### DELETE /api/teams/:teamId/members/:userId

Remove a member from the team.

**Auth required:** Yes (admin, or the member removing themselves)

**Response — 204 No Content**

---

### PATCH /api/teams/:teamId/members/:userId

Change a member's role.

**Auth required:** Yes (admin)

**Request body**
```json
{
  "role": "admin | member"
}
```

**Response — 200 OK**
```json
{
  "userId": "usr_abc",
  "role": "admin"
}
```

---

## Status codes used across all auth endpoints

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Validation error — missing or malformed fields |
| 401 | Not authenticated / bad credentials |
| 403 | Authenticated but not authorised for this action |
| 500 | Internal server error |

---

## Current stub (Phase 0)

The file `src/app/api/auth/route.ts` is a stub that returns `ok: true` and sets a dummy cookie.
Replace with real logic when the backend is ready.

```ts
// shell/src/app/api/auth/route.ts
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'taskflow_session=stub; Path=/; HttpOnly; SameSite=Lax',
    },
  });
}
```
