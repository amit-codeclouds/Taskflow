import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Reusable profile avatar — shows the user's photo when avatarUrl is set,
 * otherwise falls back to a colored initials circle. Mirrors shell/mfe-task's
 * React Avatar component so all three zones render the profile icon the same way.
 *
 * @example
 *   <app-avatar [avatarUrl]="auth.user().avatarUrl" [initials]="auth.user().initials" [name]="auth.user().name"></app-avatar>
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input() avatarUrl?: string;
  @Input() initials = '??';
  @Input() name = '';
}
