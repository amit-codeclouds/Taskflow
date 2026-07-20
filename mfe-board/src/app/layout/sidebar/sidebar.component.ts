import { Component } from '@angular/core';
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
  constructor(public auth: AuthService) {
    this.auth.ensureLoaded();
  }

  // Matches shell/mfe-task's own Sidebar label exactly — derived from first name,
  // not the real workspace name (both apps do this the same way).
  get workspaceLabel(): string {
    const name = this.auth.user().name;
    return name ? `${name.split(' ')[0]}'s Workspace` : 'My Workspace';
  }
}
