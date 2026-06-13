# Database Schema

---

## PostgreSQL

All tables use `UUID` primary keys and `TIMESTAMPTZ` for timestamps.
`task_number` is a project-scoped sequential integer used to generate human-
readable IDs like `TF-001`.

---

### `users`

```sql
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  email            TEXT        NOT NULL UNIQUE,
  avatar_initials  CHAR(2)     NOT NULL,           -- e.g. 'AC'
  avatar_url       TEXT,
  password_hash    TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `projects`

```sql
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL UNIQUE,          -- 'taskflow' → prefix 'TF'
  owner_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `teams`

> Source: `shell/components/teams/TeamsScreen.tsx`

```sql
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  color       CHAR(7)     NOT NULL DEFAULT '#6155DD',  -- hex color for display
  owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `team_members`

```sql
CREATE TABLE team_members (
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'developer',
                                               -- 'admin' | 'pm' | 'tl' | 'developer'
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id),
  CHECK (role IN ('admin', 'pm', 'tl', 'developer'))
);
-- Application-level invariant: every team must have at least one row with role = 'admin'.
```

---

### `invitations`

> Tracks pending email invites from `TeamsScreen` → InviteForm.

```sql
CREATE TABLE invitations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_by   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  email        TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending',
                                               -- 'pending'|'accepted'|'declined'|'expired'
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, email)
);

CREATE INDEX invitations_email_idx   ON invitations(email);
CREATE INDEX invitations_team_id_idx ON invitations(team_id);
```

---

### `project_members`

```sql
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member',       -- 'owner' | 'member'
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);
```

---

### `sprints`

```sql
CREATE TABLE sprints (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'planning', -- 'planning'|'active'|'completed'
  start_date DATE,
  end_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `board_statuses`

> Dynamic statuses per team. Each team owns its own ordered list of statuses.

```sql
CREATE TABLE board_statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  position    INTEGER     NOT NULL DEFAULT 0,    -- column order on the board
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, name)
);

CREATE INDEX board_statuses_team_id_idx ON board_statuses(team_id, position);
```

Application-level invariant: a team must always have at least one `board_statuses` row. Deleting the last status returns `422`. Deleting a non-last status soft-deletes its tasks (sets `tasks.deleted_at`).

---

### `tasks`

```sql
CREATE TABLE tasks (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number          INTEGER NOT NULL,                  -- scoped to project; TF-001
  team_id              UUID    NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status_id            UUID    NOT NULL REFERENCES board_statuses(id) ON DELETE RESTRICT,
  project_id           UUID    REFERENCES projects(id) ON DELETE SET NULL,
  sprint_id            UUID    REFERENCES sprints(id)  ON DELETE SET NULL,
  assignee_id          UUID    REFERENCES users(id)    ON DELETE SET NULL,
  title                TEXT        NOT NULL,
  description          TEXT,                              -- rich-text (HTML/markdown)
  priority             TEXT        NOT NULL DEFAULT 'medium',
                                                          -- 'high'|'medium'|'low'
  expected_completion  DATE,                              -- renamed from due_date
  progress             SMALLINT    NOT NULL DEFAULT 0,    -- 0–100, manual
  image_urls           TEXT[]      NOT NULL DEFAULT '{}', -- Cloudinary secure URLs
  created_by           UUID    NOT NULL REFERENCES users(id),
  deleted_at           TIMESTAMPTZ,                       -- soft-delete (set when parent status is deleted)
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, task_number),
  CHECK (progress BETWEEN 0 AND 100)
);

CREATE INDEX tasks_team_id_idx      ON tasks(team_id);
CREATE INDEX tasks_status_id_idx    ON tasks(status_id);
CREATE INDEX tasks_project_id_idx   ON tasks(project_id);
CREATE INDEX tasks_sprint_id_idx    ON tasks(sprint_id);
CREATE INDEX tasks_assignee_id_idx  ON tasks(assignee_id);
CREATE INDEX tasks_deleted_at_idx   ON tasks(deleted_at);
```

All read queries must filter `deleted_at IS NULL` unless explicitly recovering deleted tasks.

---

### `labels`

```sql
CREATE TABLE labels (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL UNIQUE              -- 'feature'|'bug'|'design'|'docs'|'infra'|'refactor'
);
```

---

### `task_labels`

```sql
CREATE TABLE task_labels (
  task_id  UUID NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);
```

---

### `comments`

```sql
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID        NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_task_id_idx ON comments(task_id);
```

---

## MongoDB Atlas

Each section names the **collection**, lists required fields, and shows an
example document.

---

### `activity_logs`

Append-only. Never updated, only inserted.

```json
{
  "_id":        "ObjectId",
  "entityType": "task",
  "entityId":   "uuid-of-task",
  "actorId":    "uuid-of-user",
  "action":     "status_changed",
  "diff": {
    "status": { "from": "todo", "to": "in-progress" }
  },
  "timestamp":  "2026-06-11T10:00:00Z"
}
```

**Indexes:**
```
{ entityId: 1, timestamp: -1 }
{ actorId: 1,  timestamp: -1 }
```

---

### `notifications`

```json
{
  "_id":         "ObjectId",
  "recipientId": "uuid-of-user",
  "type":        "task_assigned",
  "payload": {
    "taskId":    "uuid-of-task",
    "taskTitle": "Implement authentication flow",
    "assignedBy":"uuid-of-assigner"
  },
  "read":        false,
  "createdAt":   "2026-06-11T10:00:00Z"
}
```

**Indexes:**
```
{ recipientId: 1, read: 1, createdAt: -1 }
```

---

### `user_preferences`

One document per user. `_id` equals `users.id` from PostgreSQL.

```json
{
  "_id":                  "uuid-of-user",
  "theme":                "dark",
  "sidebarCollapsed":     false,
  "defaultTaskFilter":    "all",
  "notificationsEnabled": true
}
```

No index needed beyond `_id`.

---

### `audit_trail`

Tracks all mutating API calls for compliance. Separate from activity logs
(which are user-facing).

```json
{
  "_id":        "ObjectId",
  "service":    "task-service",
  "userId":     "uuid-of-user",
  "method":     "PATCH",
  "path":       "/tasks/uuid-of-task",
  "requestBody": { "status": "done" },
  "statusCode": 200,
  "durationMs": 42,
  "timestamp":  "2026-06-11T10:00:00Z"
}
```

**Indexes:**
```
{ userId: 1,  timestamp: -1 }
{ service: 1, timestamp: -1 }
```
TTL index: expire after 90 days
```
{ timestamp: 1 }, { expireAfterSeconds: 7776000 }
```
