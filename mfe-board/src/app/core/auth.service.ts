import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserWorkspaceMembership {
  workspaceId: string;
  name: string;
  role: string;
  status: string;
  joinedAt: string | null;
}

// Matches UserResponseDto from the backend OpenAPI spec
export interface MeResponse {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarInitials?: string;
  avatarUrl?: string;
  workspaces?: UserWorkspaceMembership[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title: string;
  initials: string;
  avatarUrl?: string;
  workspaceName: string;
}

const EMPTY_USER: AuthUser = { id: '', name: '', email: '', title: '', initials: '??', workspaceName: '' };

function getInitials(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser>(EMPTY_USER);
  readonly loading = signal(true);
  private loaded = false;

  constructor(private http: HttpClient) {}

  // Fetches /api/auth/me once and caches it for the lifetime of the app —
  // Sidebar and Topbar both call this and share the same singleton result.
  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.http.get<{ result: MeResponse }>('/api/auth/me').subscribe({
      next: (res) => {
        const data = res.result;
        // Prefer the workspace the user owns — `workspaces[]` order isn't guaranteed,
        // so picking index 0 could land on a workspace they were merely invited into.
        const workspace = data.workspaces?.find((w) => w.role === 'owner') ?? data.workspaces?.[0];
        this.user.set({
          id: data.id,
          name: data.name ?? '',
          email: data.email ?? '',
          title: data.title ?? '',
          initials: data.avatarInitials || getInitials(data.name),
          avatarUrl: data.avatarUrl,
          workspaceName: workspace?.name ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        // Leave the empty-user fallback in place — sidebar/topbar render generic
        // placeholders until a session exists.
        this.loading.set(false);
      },
    });
  }
}
