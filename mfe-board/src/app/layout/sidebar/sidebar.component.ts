import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // My Tasks / Profile / Settings are other zones reached via a hard <a> nav —
  // navigating to one of them unmounts this component (full page reload), so a
  // one-time check against the current URL is enough; there's no in-app transition
  // between them to react to.
  private readonly path = typeof window !== 'undefined' ? window.location.pathname : '';
  readonly isTasksActive = this.path.startsWith('/tasks');
  readonly isProfileActive = this.path.startsWith('/profile');
  readonly isSettingsActive = this.path.startsWith('/settings');

  // The "Dashboard" nav item's href="/" points to the Shell's home page — a
  // different app/zone entirely. This sidebar only ever renders inside the
  // Board MFE (mounted at /board/*), so it is always "Task Board" while this
  // component exists; "Dashboard" never applies here, regardless of whether
  // the current page within this zone is the team-listing root or a specific
  // team's Kanban board (both are internal routes of the Task Board section).
  readonly isDashboardActive = false;
  readonly isTaskBoardActive = true;

  constructor(public auth: AuthService) {
    this.auth.ensureLoaded();
  }

  get workspaceLabel(): string {
    return this.auth.user().workspaceName || 'My Workspace';
  }
}
