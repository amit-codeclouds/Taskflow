# Teams Requirements

## Overview

Teams are the primary unit of organisation in Taskflow. Every Kanban board is scoped to a team. Tasks belong to a team. People can belong to multiple teams. The Teams screen lets workspace admins create teams, manage membership, and invite new people directly into a team.

**Routes**:
- `/teams` — Teams list (Shell, Next.js)
- `/teams/new` — Create Team page (Shell, Next.js)
- `/teams/:id` — Manage Team page (Shell, Next.js)

**Components**:
- `shell/components/teams/TeamsScreen.tsx` — list + stats
- `shell/app/(shell)/teams/new/page.tsx` — Create Team full page
- `shell/app/(shell)/teams/[id]/page.tsx` — Manage Team full page
- `shell/components/teams/TeamInviteModal.tsx` — Invite by email (modal, stays open)

---

## User Stories

| # | Story |
|---|---|
| US-TEAM-1 | As an admin I can create a new team with a name, description, and colour |
| US-TEAM-2 | As an admin I can see all teams in the workspace |
| US-TEAM-3 | As an admin I can add existing workspace members to a team |
| US-TEAM-4 | As an admin I can invite someone by email directly into a team (they also join the workspace) |
| US-TEAM-5 | As an admin I can change a team member's role (Admin / PM / Team Lead / Developer) via a dropdown on the Manage Team page |
| US-TEAM-6 | As an admin I can remove a member from a team |
| US-TEAM-7 | As any member I can see which teams I belong to and who else is on those teams |
| US-TEAM-8 | As an admin I can delete a team |

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Teams                                    [New Team]    │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Total Teams  │  Total Members  │  Pending Invites│   │
│  │     2        │       4         │       0         │   │
│  └─────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ● Taskflow Core                                  │   │
│  │   Engineering team building the core platform.  │   │
│  │   ●●● AC JD MK    3 members  [Manage] [Invite]  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ● Design System                                  │   │
│  │   Maintains the shared UI component library.    │   │
│  │   ●● AC SR    2 members  [Manage] [Invite]       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Team Card

Each team card shows:

| Field | Description |
|---|---|
| Colour initial | Coloured badge showing first 2 chars of team name |
| Name | Team display name |
| Description | Short description string |
| Member avatars | Up to 4 stacked avatar circles; overflow shown as +N badge |
| Members count | Active member count · Pending invite count (amber) |
| Actions | **Manage** (navigates to `/teams/:id`) · **Invite** (opens TeamInviteModal) |

### Member avatar tooltip

Hovering an avatar shows a tooltip card:
- Mini avatar + member name
- Member title (or `—`)
- "Pending invite" badge in amber if `isPending === true`

---

## Create Team Flow

**Route**: `/teams/new`

1. User clicks **"New Team"** → navigates to `/teams/new` (full page, not modal).
2. Page has two sections:

   **Team Details card**
   - **Team name** (required, max 60 chars, Formik + Yup validation, inline error on touch)
   - **Description** (optional, max 200 chars)
   - **Team colour** — 8-swatch colour picker (selected swatch has ring + checkmark)

   **Team Members card**
   - **Team admin row** — read-only row showing the logged-in user with "Admin" badge + Lock icon. Creator is always admin; cannot be changed here.
   - **Add members** — React Select multi-select of all workspace members (excluding the logged-in user). Optional.
   - **Assign roles** — For each selected member, a row appears with their avatar, name, title, a React Select role dropdown (default: Developer), and a remove (×) button.

3. User submits → `POST /api/teams`.
4. Navigates back to `/teams`; new team card appears in the list.
5. Creator is automatically assigned as `admin`.

---

## Manage Team Page

**Route**: `/teams/:id`

Clicking **"Manage"** on a team card navigates to `/teams/:id` (full page, not modal).

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Teams                                     │
│  Taskflow Core                           [Save Changes│
│  Engineering team building the platform.  / Cancel]  │
│  ──────────────────────────────────────────────────  │
│  Team Details card: name, description, colour picker │
│  ──────────────────────────────────────────────────  │
│  Members card:                                       │
│  AC  Arkabrata C.  Engineer    [Admin    ▾]  [🔒]    │
│  JD  John Doe      Product Mgr [PM       ▾]  [✕]    │
│  MK  Maya Khan     Designer    [Developer▾]  [✕]    │
│                                                      │
│  Add from workspace: [Select member ▾] [Role ▾] Add │
│  ──────────────────────────────────────────────────  │
│  Danger Zone: [Delete Team]                          │
└──────────────────────────────────────────────────────┘
```

### Team Details section

- **Team name** — editable, Formik + Yup validation (required, max 60)
- **Description** — editable, optional, max 200
- **Team colour** — same 8-swatch colour picker as Create

### Members section

Each member row shows:
- Avatar, name, title
- **Role React Select dropdown** (Admin / PM / Team Lead / Developer)
- **Remove button** (×) — confirm dialog before removing

**Last admin protection**: if `adminCount === 1` and the member is the only admin, both the role dropdown and the Remove button are locked (cannot be changed).

### Add from Workspace

- React Select dropdown listing workspace members not already on this team
- Role Select (default Developer)
- Add button → appends member to the list
- `POST /api/teams/:id/members`

### Save / Cancel

- **Save Changes** is enabled when name/description/colour has changed OR the member list has changed.
- Saves → `PATCH /api/teams/:id` (meta changes) + member adds/removes/role changes.
- Navigates back to `/teams` on success.

### Danger Zone

- **Delete Team** button (red border card at bottom)
- Confirm dialog: "This will permanently delete the team. Tasks will not be deleted."
- `DELETE /api/teams/:id` → navigates back to `/teams`.

---

## Invite by Email (Modal)

Clicking **"Invite"** on a team card opens the `TeamInviteModal` (modal, not a page navigation).

**Fields** (Formik + Yup):
- **Email address** (required, valid email, must not already be a member of this team)
- **Assign role** — React Select, 4 roles, default: Developer
- **Also add to workspace** checkbox — opt-in only; if unchecked, invite is scoped to this team only

**Submit** → `POST /api/teams/:id/invite`

**Outcomes**:
1. If the email belongs to an existing workspace member: adds them to the team directly.
2. If the email is new: sends an invitation email. On acceptance the person joins the workspace and the team.
3. Pending member appears on the team card with a dashed avatar ring.

**Success state**: modal body cross-fades to a green checkmark + "Invite sent!" confirmation before closing.

---

## Delete Team

- Admin clicks "Delete Team" in the Danger Zone card on the Manage Team page.
- Confirmation dialog: "This will permanently delete the team. Tasks will not be deleted."
- `DELETE /api/teams/:id`.
- Navigates to `/teams`; team card disappears from the list.

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
{
  "email": "newperson@example.com",
  "role": "developer",
  "addToWorkspace": false
}
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

### Data Model

Team membership is stored on the `User` document as a `TeamMembership` entry — not as a join table or a separate collection:

```
User {
  teams: [{ teamId, workspaceId, role, joinedAt }]
}
```

`Team.members` in the API response is a **derived view** — the backend queries all Users whose `User.teams` array contains `{ teamId: this.id, workspaceId: current }` and inlines their display fields (`name`, `email`, `title`, `avatarInitials`).

Practical consequences:
- Adding a member = append `TeamMembership` to `User.teams`.
- Changing a role = update `User.teams[teamId].role`.
- Removing a member from a team = remove the `TeamMembership` entry from `User.teams` (does **not** remove their workspace membership).
- Deleting a team = remove all `TeamMembership` entries where `teamId === deleted` from every User.

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
- Admins add members from workspace or invite by email. New members default to `developer`.
- Admin can change any member's role at any time using the role dropdown on the Manage Team page → `PATCH /api/teams/:id/members/:userId` with `{ "role": "admin" | "pm" | "tl" | "developer" }`.
- A team must always have at least one `admin` — the last admin's role dropdown and Remove button are locked.

---

## Permissions Summary

| Action | Who |
|---|---|
| View teams list | Any workspace member |
| Create team (`/teams/new`) | Any workspace member |
| Manage team (`/teams/:id`) | Team Admin only |
| Delete team | Team Admin only |
| Add member from workspace | Team Admin |
| Invite by email | Team Admin |
| Remove member | Team Admin |
| Change member role | Team Admin |
