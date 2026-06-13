# Settings Requirements

## Overview

The Settings screen lets users manage their personal profile and application preferences. It is part of the Shell app and has no impact on other workspace members.

**Route**: `/settings` (Shell, Next.js)  
**Component**: `shell/src/components/settings/SettingsScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-SET-1 | As a user I can update my display name |
| US-SET-2 | As a user I can update my email address |
| US-SET-3 | As a user I can update my job title |
| US-SET-4 | As a user I can switch between Dark and Light theme |
| US-SET-5 | As a user I can enable or disable in-app notifications |
| US-SET-6 | As a user I can enable or disable email notifications |
| US-SET-7 | As a user I can see my settings without any loading delay (optimistic UI from session) |

---

## Sections

### 1. Profile

Fields:

| Field | Type | Validation |
|---|---|---|
| Display Name | Text input | Required, max 80 chars |
| Email | Email input | Required, valid email format |
| Job Title | Text input | Optional, max 100 chars |
| Avatar | Initials (auto-computed from name) | Read-only; future: upload image |

Action: **Save Changes** button → `PATCH /api/users/:id`.

---

### 2. Theme

A two-option toggle or radio group:

| Option | Value |
|---|---|
| Dark (default) | `dark` |
| Light | `light` |

- Change is applied immediately (CSS class on `<html>` or `<body>`).
- Saved to `PATCH /api/preferences` → `{ "theme": "dark" | "light" }` (MongoDB).
- On next load, `GET /api/preferences` restores the saved value.

---

### 3. Notifications

Toggle switches for notification types:

| Toggle | Key | Description |
|---|---|---|
| In-app notifications | `notificationsEnabled` | Bell icon badge and notification panel |
| Email notifications | (future field) | Digest emails for assigned/mentioned |

- Saved to `PATCH /api/preferences` on each toggle change (no Save button needed).
- Default: all enabled.

---

### 4. Sidebar State

A hidden preference:

- `sidebarCollapsed: boolean` — whether the sidebar was last collapsed.
- Not shown as a UI control in Settings; managed automatically by the sidebar toggle.
- Persisted via `PATCH /api/preferences` → `{ "sidebarCollapsed": true }`.

---

## API Endpoints

### `PATCH /api/users/:id`

Update profile fields.

**Auth**: Required. Users can only update their own profile.

**Request**
```json
{
  "name": "Arkabrata C.",
  "email": "arko@codeclouds.com",
  "title": "Senior Engineer"
}
```

**Success (200)**
```json
{ "user": { "id": "u1", "name": "Arkabrata C.", ... } }
```

**Error (409)** — email already taken
```json
{ "message": "This email is already in use by another account." }
```

---

### `GET /api/preferences`

Returns current user's preferences.

**Response (200)**
```json
{
  "theme": "dark",
  "sidebarCollapsed": false,
  "defaultTaskFilter": "all",
  "notificationsEnabled": true
}
```

---

### `PATCH /api/preferences`

Partial update. Any subset of preference fields.

**Request**
```json
{ "theme": "light" }
```

**Success (200)**
```json
{ "preferences": { "theme": "light", ... } }
```

---

## Persistence Model

Profile data (`name`, `email`, `title`) is stored in PostgreSQL (`users` table).  
Preferences (`theme`, `sidebarCollapsed`, `notificationsEnabled`) are stored in MongoDB `user_preferences` collection, keyed by `_id = user.id`.

The two stores are independent and are fetched in parallel on settings page load.

---

## Out of Scope

- Password change (needs a separate forgot-password flow)
- Avatar image upload (initials-based avatar only for now)
- Billing / subscription management
- Workspace-level settings (separate admin panel, not yet planned)
- Delete account
