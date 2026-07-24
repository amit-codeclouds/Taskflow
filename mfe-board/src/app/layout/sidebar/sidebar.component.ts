import { Component, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AvatarComponent],
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

  // Dashboard vs. Task Board are both routes inside this same Angular app, and
  // BoardComponent/DashboardComponent navigate between each other via the Router
  // (no reload) — so these track the Router reactively instead.
  readonly isDashboardActive = signal(true);
  readonly isTaskBoardActive = signal(false);

  constructor(public auth: AuthService, private router: Router) {
    this.auth.ensureLoaded();
    this.updateBoardActive(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateBoardActive(e.urlAfterRedirects));
  }

  // The route table only has DashboardComponent at '' — everything else
  // (a team's board, its archive, an archived task) belongs to the Task Board tab.
  private updateBoardActive(url: string): void {
    const isDashboard = url === '/' || url === '';
    this.isDashboardActive.set(isDashboard);
    this.isTaskBoardActive.set(!isDashboard);
  }

  // Matches shell/mfe-task's own Sidebar label exactly — derived from first name,
  // not the real workspace name (both apps do this the same way).
  get workspaceLabel(): string {
    const name = this.auth.user().name;
    return name ? `${name.split(' ')[0]}'s Workspace` : 'My Workspace';
  }
}
