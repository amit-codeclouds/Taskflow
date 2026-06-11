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
  role       TEXT NOT NULL DEFAULT 'member',   -- 'admin' | 'member'
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
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

### `tasks`

```sql
CREATE TABLE tasks (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number   INTEGER NOT NULL,                  -- scoped to project; TF-001
  project_id    UUID    REFERENCES projects(id) ON DELETE SET NULL,
  sprint_id     UUID    REFERENCES sprints(id)  ON DELETE SET NULL,
  assignee_id   UUID    REFERENCES users(id)    ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  status        TEXT        NOT NULL DEFAULT 'todo',
                                                   -- 'todo'|'in-progress'|'review'|'done'
  priority      TEXT        NOT NULL DEFAULT 'medium',
                                                   -- 'high'|'medium'|'low'
  due_date      DATE,
  created_by    UUID    NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, task_number)
);

CREATE INDEX tasks_project_id_idx   ON tasks(project_id);
CREATE INDEX tasks_sprint_id_idx    ON tasks(sprint_id);
CREATE INDEX tasks_assignee_id_idx  ON tasks(assignee_id);
CREATE INDEX tasks_status_idx       ON tasks(status);
```

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
