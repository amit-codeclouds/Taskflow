# People (Workspace Members) Requirements

## Overview

The People screen is the workspace-level directory. It shows every person who has access to the workspace — both active members and those with pending invitations. Admins can invite new people here before (or instead of) inviting them directly to a specific team.

**Route**: `/people` (Shell, Next.js)  
**Component**: `shell/src/components/people/PeopleScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-PEOPLE-1 | As an admin I can see all workspace members in a single list |
| US-PEOPLE-2 | As an admin I can invite someone to the workspace by email |
| US-PEOPLE-3 | As an admin I can see whether an invited person has accepted or is still pending |
| US-PEOPLE-4 | As an admin I can filter the list by status (All / Active / Pending) |
| US-PEOPLE-5 | As an admin I can remove a member from the workspace |
| US-PEOPLE-6 | As any member I can see my teammates' names, emails, titles, and team memberships |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  People                                [Invite Member]  │
│  ─────────────────────────────────────────────────────  │
│  [All]  [Active]  [Pending]                             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Avatar  Name           Email         Teams  Status│   │
│  │  AC   Arkabrata C.  arko@...    [Core][DS]  Active│   │
│  │  JD   John Doe      john@...    [Core]       Active│   │
│  │  MK   Maya Khan     maya@...    [Core]       Active│   │
│  │  SR   Sam Roy       sam@...     [DS]         Active│   │
│  │  PR   Priya R.      priya@...   —            Pending│  │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Member List

Each row in the member list shows:

| Field | Description |
|---|---|
| Avatar | Initials-based circle, colored by user |
| Name | Full display name |
| Email | Workspace email address |
| Job title | Role/title string (e.g. "Engineer", "Designer") |
| Teams | Badges showing which teams they belong to |
| Status | `Active` (green) or `Pending` (amber) |
| Actions | (Admin only) Remove button |

---

## Filter Tabs

| Tab | Shows |
|---|---|
| All | Every member regardless of status |
| Active | Only members with status `active` |
| Pending | Only invited members who have not yet accepted |

The count of each status is shown in the tab label (e.g. "Pending (1)").

---

## Invite Member Flow

1. User clicks **"Invite Member"** button (top-right).
2. A modal/drawer opens with a single field: **Email address**.
3. User enters the email and submits.
4. `POST /api/people/invite` is called.
5. The system sends an invitation email to that address.
6. The invitee appears in the list immediately with status `Pending`.
7. When the invitee clicks the link in their email and accepts, their status changes to `Active`.

**Validation**:
- Email must be a valid email address.
- Duplicate invite to an email that already has a pending invite → show error "An invitation is already pending for this email."
- Email already a workspace member → show error "This person is already a member."

---

## Remove Member

1. Admin clicks the remove action on a member row.
2. Confirmation dialog: "Remove {name} from the workspace? This will remove them from all teams."
3. On confirm → `DELETE /api/people/:userId`.
4. Member disappears from the list.
5. They are also removed from all team memberships.

**Rules**:
- A user cannot remove themselves.
- Removing a member does not delete their tasks — tasks remain, assignee becomes empty.

---

## Stats Bar (optional, top of screen)

A compact row of three counts:

| Stat | Value |
|---|---|
| Total Members | `GET /api/people/stats` → `totalMembers` |
| Active | `active` |
| Pending Invites | `pendingInvites` |

---

## API Endpoints

### `GET /api/people`

Returns all workspace members.

**Query params**:
- `status=active|pending` (optional — omit for all)

**Response (200)**
```json
{
  "members": [
    {
      "id": "u1",
      "name": "Arkabrata C.",
      "email": "arko@codeclouds.com",
      "avatarInitials": "AC",
      "title": "Engineer",
      "teamIds": ["team_1", "team_2"],
      "status": "active"
    }
  ]
}
```

---

### `GET /api/people/stats`

**Response (200)**
```json
{
  "totalMembers": 5,
  "active": 4,
  "pendingInvites": 1,
  "totalTeams": 3
}
```

---

### `POST /api/people/invite`

**Request**
```json
{ "email": "newperson@example.com" }
```

**Success (201)**
```json
{
  "invitation": {
    "id": "inv_abc",
    "email": "newperson@example.com",
    "status": "pending",
    "expiresAt": "2026-06-19T00:00:00Z"
  }
}
```

**Error (409)** — duplicate or already a member
```json
{ "message": "An invitation is already pending for this email." }
```

---

### `DELETE /api/people/:userId`

**Success (200)**
```json
{ "ok": true }
```

---

## Empty State

When the workspace has only one member (the owner):
- Show a friendly message: "It's just you here. Invite your team to get started."
- Show the Invite Member button prominently.

---

## Permissions

| Action | Who can do it |
|---|---|
| View member list | Any workspace member |
| Invite member | Admin only |
| Remove member | Admin only |
| View own profile | Any member |
