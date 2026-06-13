# Taskflow — Overall User Flow

This document describes the complete user journey from first load to daily task work.

---

## High-Level Flow

```
Open app (localhost:8787)
        │
        ▼
  ┌─────────────┐
  │  Login Page │  ← Not yet built (Phase 0 has a stub)
  └──────┬──────┘
         │ POST /api/auth/login → sets taskflow_session cookie
         ▼
  ┌─────────────┐
  │  Dashboard  │  ← Shell / (home)
  └──────┬──────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
  /people                          /teams
  Add workspace members            Create a team
    │                                 │
    │ Invite by email                 │ Name + color
    │ Pending → Accepted              │ Add workspace members to team
    │                                 │
    └────────────┬────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
      /tasks           /board
   My Tasks list    Team Kanban board
   (cross-project)  (team-scoped)
```

---

## Step-by-Step User Journey

### Step 1 — Login

**Entry point**: `localhost:8787` (Cloudflare Worker → Shell)

1. User lands on the Login page (email + password form).
2. Submits credentials → `POST /api/auth/login`.
3. Server validates credentials, sets `taskflow_session` httpOnly cookie on the shared domain.
4. User is redirected to `/` (Dashboard).

**Rules**:
- Session cookie is shared across all zones (`/tasks`, `/board`) automatically.
- No token passing, no `postMessage`.
- On page refresh, the session cookie is read and the user stays logged in.
- Invalid credentials → inline error message, no redirect.

---

### Step 2 — Dashboard

**Route**: `/` (Shell)

After login the user sees the home dashboard:

- **4 stat cards**: Total Tasks · In Progress · Completed · Board Items
- **App preview cards**: Tasks MFE and Board MFE with a "Open" CTA
- **Project timeline**: Phase strips showing what has shipped and what is next

The dashboard gives a bird's-eye view of the workspace before the user drills into anything.

**From here the user can navigate to**:
- `/people` to manage who is in the workspace
- `/teams` to create or manage teams
- `/tasks` to see their personal task list
- `/board` to open the team board
- `/settings` to update profile

---

### Step 3 — Add People (workspace member management)

**Route**: `/people` (Shell)

Before creating a team, the workspace admin adds the people who will be on the teams.

1. User opens `/people`.
2. Sees a list of current workspace members with name, email, job title, team badges, and status (Active / Pending).
3. Clicks **"Invite Member"** → enters email address → submits.
4. An invitation email is sent. The invitee appears in the list with status "Pending".
5. When the invitee accepts, their status changes to "Active" and they become a full workspace member.

**Filters available**:
- All Members · Active · Pending

**Actions per member**:
- View profile details
- Remove from workspace (admin only)

---

### Step 4 — Create a Team

**Route**: `/teams` (Shell)

1. User opens `/teams`.
2. Sees existing teams in a card grid (name, color, member count, pending invites).
3. Clicks **"New Team"** → drawer opens.
4. Fills in: Team Name · Description · Color (color picker).
5. Submits → team is created.
6. User then opens the team and adds members:
   - **From workspace**: picks from existing workspace members (dropdown).
   - **By email**: invites someone not yet in the workspace (sends an invitation that also adds them to the team on acceptance).
7. Each team member is assigned a role: **Admin** or **Member**.

**Rules**:
- A user can belong to multiple teams.
- The team creator is automatically the team owner (Admin role).
- Deleting a team does not delete its tasks — tasks become unassigned from the team.

---

### Step 5 — My Tasks (cross-project list view)

**Route**: `/tasks` (Task MFE, Next.js)

This is the user's personal task inbox. It aggregates all tasks assigned to the logged-in user across every project and team they belong to.

**Layout**:
- **4 stat cards**: Total · In Progress · In Review · Done
- **Filter tabs**: All · In Progress · Review · To Do · Done
- **Team filter dropdown**: filter by a specific team, or show all
- **Task rows**: ID · Title · Label badge · Priority dot · Due date · Team name · Status badge

**Key behaviour**:
- Does NOT show a single project. Shows ALL tasks assigned to the user.
- Changing the status of a task from this view updates it in the backend and reflects on the board.
- Clicking a task row opens a task detail drawer (planned for Phase 1).
- New Task button opens a creation form where the user picks the project, team, and assigns it to themselves or others.

---

### Step 6 — Team Board (Kanban view)

**Route**: `/board` (Board MFE, Angular)

The board is scoped to **one team at a time**. The user selects which team to view from a dropdown in the topbar.

**Columns** (fixed, in order):
1. **To Do** — work not started
2. **In Progress** — actively being worked on
3. **Review** — submitted for review / PR open
4. **Done** — shipped / closed

**Each task card shows**:
- Task ID (e.g. TF-003)
- Title
- Label badge (feature / bug / design / docs / infra / refactor)
- Priority indicator dot (high = red, medium = amber, low = green)
- Due date
- Assignee avatar

**Actions**:
- Drag a card from one column to another → `PATCH /api/board/move` → status updates.
- Click "+" in a column header → create a task pre-filled with that column's status.
- Click a card → open task detail drawer (planned).

**Rules**:
- Board only shows tasks for the selected team.
- If a task belongs to multiple sprints, it appears under the active sprint filter.
- The board is team-scoped, not project-scoped — one team can span multiple projects.

---

### Step 7 — Settings

**Route**: `/settings` (Shell)

1. **Profile**: name, email, avatar, job title — `PATCH /api/users/:id`.
2. **Theme**: Dark / Light toggle — saved to `user_preferences` in MongoDB.
3. **Notifications**: toggle email + in-app notifications per type — saved to `user_preferences`.

---

## Navigation Rules

| From | To | Navigation type |
|---|---|---|
| Shell (`/`) | `/tasks` | `<a>` tag (cross-zone hard navigate) |
| Shell (`/`) | `/board` | `<a>` tag (cross-zone hard navigate) |
| Shell (`/teams`) | `/teams` | `<Link>` (same zone) |
| Shell (`/people`) | `/people` | `<Link>` (same zone) |
| Task MFE any page | `/board` | `<a>` tag (cross-zone) |
| Board MFE any page | `/tasks` | `<a>` tag (cross-zone) |
| Any zone | `/` | `<a>` tag (cross-zone to shell) |

**Never** use `<Link>` for cross-zone navigation — it silently breaks.

---

## Error States

| Scenario | Behaviour |
|---|---|
| Session expired | Redirect to login, preserve intended destination in query param |
| Upstream MFE unreachable | Cloudflare Worker returns `502 Bad Gateway` |
| API 4xx | Inline error message in the triggering component |
| API 5xx | Toast notification "Something went wrong. Try again." |
| No tasks for filter | Empty state illustration + "No tasks found" message |
| Empty team board | Empty state per column + "Add your first task" prompt |

---

## Lifecycle Summary

```
Register / Invite
      ↓
Login → Dashboard
      ↓
Add People to Workspace
      ↓
Create Team → Add Members to Team
      ↓
Create Tasks → Assign to Team Members
      ↓
Daily: My Tasks (list) ←→ Team Board (kanban)
      ↓
Ship → Move to Done
```
