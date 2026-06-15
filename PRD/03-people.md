# People (Workspace Members) Requirements

## Overview

The People screen is the workspace-level directory. It shows every person who has access to the workspace — both active members and those with pending invitations. Admins can invite new people, resend pending invites, and remove members.

**Route**: `/people` (Shell, Next.js)  
**Component**: `shell/components/people/PeopleScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-PEOPLE-1 | As an admin I can see all workspace members in a single list |
| US-PEOPLE-2 | As an admin I can invite someone to the workspace by email via a modal |
| US-PEOPLE-3 | As an admin I can see whether an invited person has accepted or is still pending |
| US-PEOPLE-4 | As an admin I can filter the list by team and by status |
| US-PEOPLE-5 | As an admin I can search members by name or email |
| US-PEOPLE-6 | As an admin I can remove an active member or cancel a pending invite |
| US-PEOPLE-7 | As an admin I can resend an invite to a pending member |
| US-PEOPLE-8 | As any member I can see teammates' names, emails, titles, and team memberships |

---

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  People                               [Invite to workspace]      │
│  ──────────────────────────────────────────────────────────────  │
│  [Total Members: 5] [Active: 4] [Pending Invites: 1] [Teams: 3] │
│                                                                  │
│  [Search by name or email…]  [All teams ▾]  [All status ▾]      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Avt  Name          Title         Teams        Status  Acts │  │
│  │ AC   Arkabrata C.  Engineer      Core · DS    Active  ...  │  │
│  │ JD   John Doe      Product Mgr   Core         Active  ...  │  │
│  │ MK   Maya Khan     Designer      Core         Active  ...  │  │
│  │ SR   Sam Roy       Engineer      DS           Active  ...  │  │
│  │ PR   Priya R.      —             —            Pending ...  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Stats Row (4 cards)

| Card | Value source |
|---|---|
| Total Members | Count of all members (active + pending) — live from local state |
| Active | Count where `status === 'active'` |
| Pending Invites | Count where `status === 'pending'` |
| Teams | Total workspace teams count |

---

## Member List Columns

| Column | Notes |
|---|---|
| Avatar | Initials-based circle — accent-tinted for active, dashed-border muted for pending |
| Name | Display name (derived from email prefix for pending members) |
| Email | Workspace email |
| Title | Designation (e.g. "Engineer"). `—` if unknown (pending + not yet completed profile) |
| Teams | Colored pill badges per team |
| Status | `Active` (green pill) or `Pending` (amber pill) |
| Actions | Hover-revealed. See below. |

---

## Row Actions (hover-revealed)

| Member status | Actions |
|---|---|
| Pending | **Resend** (re-sends invitation email) + **Remove** (cancel invite) |
| Active | **Remove** (remove from workspace) |

Both remove variants open the global `ConfirmationModal` (via `useConfirm()`) with context-appropriate copy:
- Pending → "Cancel invitation?" / "Cancel the pending invite for {email}?"
- Active → "Remove member?" / "Remove {name} from this workspace?"

---

## Filters

| Filter | Control | Behaviour |
|---|---|---|
| Search | Text input | Client-side substring match on name and email |
| Team | React Select (`size: 'sm'`, non-searchable) | Options: All teams + each workspace team |
| Status | React Select (`size: 'sm'`, non-searchable) | Options: All status · Active · Pending |

All three filters compose — only rows matching all active filters are shown.

---

## Invite to Workspace Flow

1. Admin clicks **"Invite to workspace"** button (header, top-right).
2. `InviteModal` (`components/Modals/InviteModal.tsx`) opens with backdrop.
3. Single email field — Formik + Yup validation (required, valid email format).
4. Admin submits → `POST /api/people/invite`.
5. On success: modal closes, new member added to list with `status: 'pending'`. Name derived from email prefix.
6. When invitee accepts → their status becomes `active`.

**Validation errors shown inline:**
- Invalid email format
- Duplicate pending invite (409 from server)
- Already an active member (409 from server)

---

## Resend Invite

- Button visible on hover for `status: 'pending'` rows.
- Calls `POST /api/people/invite` with the same email (server re-sends the email and resets `expires_at`).
- Returns `200` (not `409`) when re-sending to an existing pending invite.

---

## Remove Member / Cancel Invite

1. Admin clicks **Remove** on any row.
2. `useConfirm()` dialog opens (global `ConfirmProvider` — no prop drilling).
3. On confirm → `DELETE /api/people/:userId`.
4. Row animates out of the list (`AnimatePresence` exit animation).
5. Stats counts update reactively.

**Rules:**
- A user cannot remove themselves.
- Removing an active member also removes them from all teams (`ON DELETE CASCADE` in DB).
- Removing a pending member cancels the invitation record.
- Removed members' tasks remain; `assignee_id` becomes `null`.

---

## Workspace Concept

Each workspace is owned by the user who created it. The workspace name is displayed in the Sidebar as `[FirstName]'s Workspace`. Other members who join see the owner's workspace name — this is how they know which workspace they belong to.

> Phase 0: workspace name is derived client-side from `taskflow_name` cookie (`user.name.split(' ')[0] + "'s Workspace"`). A real `GET /api/workspaces/current` endpoint will replace this in a future phase.

---

## API Endpoints

### `GET /api/people`

**Query params**: `teamId`, `status`, `search`, `page`, `limit`

**Response (200)**
```json
{
  "data": [
    { "id": "u1", "initials": "AC", "name": "Arkabrata C.", "email": "arko@...", "title": "Engineer", "teamIds": ["team_1"], "status": "active" }
  ],
  "total": 5, "page": 1, "limit": 50
}
```

---

### `GET /api/people/stats`

**Response (200)**
```json
{ "totalMembers": 5, "active": 4, "pendingInvites": 1, "totalTeams": 3 }
```

---

### `POST /api/people/invite`

**Request**: `{ "email": "colleague@example.com" }`

**Success (201)**: `{ "id": "uuid", "email": "...", "status": "pending", "expiresAt": "..." }`  
**Re-send (200)**: Same shape — when `email` already has a pending invite, re-sends and resets expiry.  
**Error (409)**: Already an active member.

---

### `DELETE /api/people/:userId`

Handles both active members and pending invites (same endpoint, different DB action).

**Success (200)**: `{ "ok": true }`

---

## Empty State

When the workspace has only one member (the owner): "It's just you here — invite your team to get started." with the invite button.

---

## Permissions

| Action | Who |
|---|---|
| View member list | Any workspace member |
| Invite member | Workspace admin only |
| Resend invite | Workspace admin only |
| Remove member / cancel invite | Workspace admin only |
