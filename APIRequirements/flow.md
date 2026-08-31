# Taskflow — End-to-End User Flow

> The full user-journey documentation (signup through daily task work, across
> Shell, Task MFE, and Board MFE) lives in [`flow/`](./flow/), one file per
> stage. Start at **[`flow/00-overview.md`](./flow/00-overview.md)** — it
> carries the index, the high-level journey diagram, the sidebar → route →
> app map, and a "Known gaps" table calling out every place the running code
> diverges from `PRD/` or from an earlier draft of these docs.

| File | Covers |
|---|---|
| [00-overview.md](./flow/00-overview.md) | Index, high-level journey, sidebar/route map, known gaps |
| [01-signup-and-login.md](./flow/01-signup-and-login.md) | Signup (OTP-gated, 2-step), default workspace + role, login, session, active-workspace selection |
| [02-dashboard-and-navigation.md](./flow/02-dashboard-and-navigation.md) | The home dashboard and every sidebar destination |
| [03-people-and-workspace.md](./flow/03-people-and-workspace.md) | People (workspace directory), inviting members, Pending Invitations |
| [04-teams-and-assigned-teams.md](./flow/04-teams-and-assigned-teams.md) | Creating/managing teams, per-team roles, Assigned Teams |
| [05-board-roles-and-permissions.md](./flow/05-board-roles-and-permissions.md) | The Kanban board, the dynamic Role/permission model, what's actually enforced vs. shown |
| [06-tasks-lifecycle.md](./flow/06-tasks-lifecycle.md) | Task creation, My Tasks, Team Task Board, task detail, comments, archiving, export |

Per the APIRequirements update rule in the root `CLAUDE.md`, keep this folder
updated in the same task as any frontend change that alters a flow described
here.
