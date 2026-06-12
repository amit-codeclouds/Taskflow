# Taskflow — Product Requirements Document

## Product Overview

Taskflow is a **team task management platform** for engineering teams. It lets workspace members organize work into projects, assign tasks, track progress on a per-team Kanban board, and see their own cross-project task list in one place.

The product is intentionally scoped: no time tracking, no billing, no reporting dashboards. The focus is on the core task loop — assign → work → ship.

---

## Core Value Proposition

| Problem | Taskflow solution |
|---|---|
| Tasks scattered across tools | Single list view: all your tasks, all projects |
| Board per project gets noisy | Board is scoped to a **team** — smaller, focused |
| People management is separate | Workspace People screen + per-team membership |
| Onboarding friction | Invite by email from People or Team screens |

---

## Product Boundaries (Phase 0 → Phase 2)

### In scope
- Workspace authentication (session cookie)
- People / workspace member management
- Team creation and membership
- Task creation, assignment, status, priority, labels
- My Tasks: cross-project task list per user
- Team Board: Kanban view scoped to one team
- Settings: profile, theme, notifications

### Out of scope (explicitly deferred)
- Time tracking / estimates
- File attachments
- Comments on tasks (spec exists, UI deferred)
- Advanced reporting / analytics
- Billing and subscription management
- Mobile apps
- Public API / webhooks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Shell host | Next.js 14.2 (App Router) |
| Task MFE | Next.js 14.2 (App Router) |
| Board MFE | Angular 17.3 (standalone) |
| Edge router | Cloudflare Worker |
| Shared UI | `@taskflow/ui` (React, file: reference) |
| Styling | Tailwind CSS + Inter font |
| DB (planned) | PostgreSQL (relational) + MongoDB Atlas (activity, notifications) |
| Auth (planned) | httpOnly session cookie, shared domain |

---

## Document Index

| File | Covers |
|---|---|
| `flow.md` | Full user journey from login to task completion |
| `01-auth.md` | Login, session, logout |
| `02-dashboard.md` | Home screen after login |
| `03-people.md` | Workspace member directory and invitations |
| `04-teams.md` | Team creation and membership management |
| `05-tasks.md` | My Tasks list — cross-project task view |
| `06-board.md` | Team Kanban board |
| `07-settings.md` | User profile and preferences |
| `08-architecture.md` | MFE architecture, routing, deployment |
| `09-data-models.md` | All TypeScript interfaces and enums |
| `10-api-contracts.md` | REST endpoint reference |
