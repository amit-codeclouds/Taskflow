# Teams Requirements

## Overview

Teams are the primary unit of organisation in Taskflow. Every Kanban board is scoped to a team. Tasks belong to a team. People can belong to multiple teams. The Teams screen lets workspace admins create teams, manage membership, and invite new people directly into a team.

**Route**: `/teams` (Shell, Next.js)  
**Component**: `shell/src/components/teams/TeamsScreen.tsx`

---

## User Stories

| # | Story |
|---|---|
| US-TEAM-1 | As an admin I can create a new team with a name, description, and colour |
| US-TEAM-2 | As an admin I can see all teams in the workspace |
| US-TEAM-3 | As an admin I can add existing workspace members to a team |
| US-TEAM-4 | As an admin I can invite someone by email directly into a team (they also join the workspace) |
| US-TEAM-5 | As an admin I can change a team member's role (Admin / Member) |
| US-TEAM-6 | As an admin I can remove a member from a team |
| US-TEAM-7 | As any member I can see which teams I belong to and who else is on those teams |
| US-TEAM-8 | As an admin I can delete a team |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Teams                                    [New Team]    │
│  ─────────────────────────────────────────────────────  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ ● Taskflow Core  │  │ ● Design System  │             │
│  │ 4 members        │  │ 2 members        │             │
│  │ 0 pending        │  │ 0 pending        │             │
│  │ [View] [Invite]  │  │ [View] [Invite]  │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                         │
│  ┌──────────────────┐                                   │
│  │ ● API Gateway    │                                   │
│  │ 1 member         │                                   │
│  │ 1 pending        │                                   │
│  │ [View] [Invite]  │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Team Card

Each team card shows:

| Field | Description |
|---|---|
| Colour dot | Team's hex colour |
| Name | Team display name |
| Description | Short description string |
| Members count | Number of active members |
| Pending invites | Number of outstanding invitations |
| Actions | View details · Invite to team |

---

## Create Team Flow

1. User clicks **"New Team"**.
2. A drawer/modal opens with:
   - **Team Name** (required, max 60 chars)
   - **Description** (optional, max 200 chars)
   - **Colour** — colour picker (hex value stored)
3. User submits → `POST /api/teams`.
4. New team card appears in the grid.
5. Creator is automatically assigned as Admin member of the team.

---

## Team Detail / Member Management

Clicking "View" on a team card opens a detail view showing:

```
┌──────────────────────────────────────────────────────┐
│  ● Taskflow Core                      [Add Member]   │
│  Description text here                [Invite Email] │
│  ──────────────────────────────────────────────────  │
│  Avatar  Name         Role     Joined      Actions   │
│  AC    Arkabrata C.  Admin    3 Jun 2026   [Remove]  │
│  JD    John Doe      Member   3 Jun 2026   [·]       │
│  MK    Maya Khan     Member   5 Jun 2026   [·]       │
└──────────────────────────────────────────────────────┘
```

### Add from Workspace

1. Click **"Add Member"**.
2. Dropdown shows all workspace members NOT already in this team.
3. Select a member → `POST /api/teams/:id/members`.
4. They appear in the member list immediately with role `Member`.

### Invite by Email

1. Click **"Invite Email"**.
2. Enter email address → `POST /api/teams/:id/invite`.
3. If the email belongs to a workspace member: adds them to the team directly.
4. If the email is new: sends an invitation email. On acceptance the person joins both the workspace and the team.
5. Pending invite appears in the list with a `Pending` status badge.

### Change Role

- Clicking the role badge cycles between `Member` and `Admin`.
- `PATCH /api/teams/:id/members/:userId` with `{ "role": "admin" | "member" }`.
- A team must always have at least one Admin.

### Remove Member

- Click Remove → confirmation dialog.
- `DELETE /api/teams/:id/members/:userId`.
- Their tasks in this team are not deleted — tasks remain unassigned.

---

## Delete Team

- Admin clicks "Delete Team" in the team detail header.
- Confirmation dialog: "This will permanently delete the team. Tasks will not be deleted."
- `DELETE /api/teams/:id`.
- Team card disappears from the grid.

---

## Stats Bar (top of Teams screen)

| Stat | Source |
|---|---|
| Total Teams | `GET /api/teams/stats` → `totalTeams` |
| Total Members (across all teams) | `totalMembers` |
| Pending Invites | `pendingInvites` |

---

## API Endpoints

### `GET /api/teams`

Returns all teams the current user belongs to (or all teams for admins).

**Response (200)**
```json
{
  "teams": [
    {
      "id": "team_1",
      "name": "Taskflow Core",
      "description": "Core product development",
      "color": "#6155DD",
      "ownerId": "u1",
      "members": [
        { "userId": "u1", "role": "admin", "joinedAt": "2026-06-03T00:00:00Z" }
      ],
      "pendingInvites": 0,
      "createdAt": "2026-06-03T00:00:00Z",
      "updatedAt": "2026-06-03T00:00:00Z"
    }
  ]
}
```

---

### `POST /api/teams`

**Request**
```json
{
  "name": "API Gateway",
  "description": "API and infrastructure team",
  "color": "#E09D34"
}
```

**Success (201)**
```json
{ "team": { "id": "team_3", "name": "API Gateway", ... } }
```

---

### `GET /api/teams/:id`

Returns team details + full member list.

---

### `PATCH /api/teams/:id`

Update team name, description, or colour.

**Request**
```json
{ "name": "New Name", "color": "#FF0000" }
```

---

### `DELETE /api/teams/:id`

Admin only. Returns `{ "ok": true }`.

---

### `GET /api/teams/stats`

**Response (200)**
```json
{
  "totalTeams": 3,
  "totalMembers": 7,
  "pendingInvites": 1
}
```

---

### `POST /api/teams/:id/members`

Add an existing workspace member.

**Request**
```json
{ "userId": "u3" }
```

---

### `POST /api/teams/:id/invite`

Invite by email. Creates a workspace invitation if the user doesn't exist yet.

**Request**
```json
{ "email": "newperson@example.com" }
```

---

### `DELETE /api/teams/:id/members/:userId`

Remove a member from the team (not the workspace).

---

### `PATCH /api/teams/:id/members/:userId`

Change role.

**Request**
```json
{ "role": "admin" }
```

---

## Rules and Constraints

| Rule | Detail |
|---|---|
| Min team members | 1 (the creator) |
| Min admins | 1 at all times |
| A member can belong to | Unlimited teams |
| Deleting a team affects tasks | Tasks remain, `teamId` becomes null |
| Invitations expire | After 7 days |
| Team name uniqueness | Unique per workspace |

---

## Roles (per team)

Each `team_member` row carries a **role**. Roles are scoped to one team — a user may be `Admin` on team A and `Developer` on team B.

| Role | Description |
|---|---|
| `admin` | Granted automatically to the team creator. Full control: create/edit/delete the team, invite & remove members, assign any role, full board permissions (status + task), drag any task. |
| `pm` | Project Manager. Full board operations on this team's Kanban: create/edit/delete statuses, create/edit/delete tasks, drag any task. **Cannot** manage team membership or assign roles. |
| `tl` | Team Lead. Same as PM **except** cannot create statuses (can edit/delete existing statuses). Can drag any task. Cannot manage team membership. |
| `developer` | Can create tasks; can edit and drag **only their own** tasks (tasks where they are the assignee). No status management. No member management. |

### Permission matrix

| Action | admin | pm | tl | developer |
|---|---|---|---|---|
| Edit team meta (name/desc/colour) | ✅ | ❌ | ❌ | ❌ |
| Delete team | ✅ (creator only) | ❌ | ❌ | ❌ |
| Invite members / assign roles / change roles / remove members | ✅ | ❌ | ❌ | ❌ |
| Add board status | ✅ | ✅ | ❌ | ❌ |
| Edit / delete board status | ✅ | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ | ✅ | ✅ |
| Edit any task | ✅ | ✅ | ✅ | ❌ |
| Edit own task (assignee == self) | ✅ | ✅ | ✅ | ✅ |
| Drag (move status of) any task | ✅ | ✅ | ✅ | ❌ |
| Drag own task | ✅ | ✅ | ✅ | ✅ |
| View team / view board | ✅ | ✅ | ✅ | ✅ |

`403` is returned when the role lacks permission. A team must always have **at least one `admin`** — the last admin cannot be demoted or removed.

### Assigning roles

- The creator of a team is automatically `admin`.
- Admins invite members via email or pick from the workspace. New members default to `developer`.
- Admin can change any member's role at any time via `PATCH /api/teams/:id/members/:userId` with `{ "role": "admin" | "pm" | "tl" | "developer" }`.

---

## Legacy Permissions (kept for reference)

| Action | Who |
|---|---|
| View teams list | Any workspace member |
| Create team | Any workspace member |
| Edit team (name/desc/colour) | Team Admin or Workspace Admin |
| Delete team | Team Owner (creator) or Workspace Admin |
| Add member from workspace | Team Admin |
| Invite by email | Team Admin |
| Remove member | Team Admin |
| Change member role | Team Admin |
