import { CommonModule, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthListenerService } from '../services/auth-listener.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <section class="board">
      <p class="phase">PHASE 0 · MFE FOUNDATION</p>
      <h2>Kanban Board — coming soon</h2>
      <p class="muted">Board MFE (Angular · localhost:4200)</p>
      <p class="token">
        Auth token from Shell:
        <ng-container *ngIf="auth.token$ | async as token; else waiting">
          <span class="ok">received</span>
        </ng-container>
        <ng-template #waiting><span class="warn">waiting…</span></ng-template>
      </p>
    </section>
  `,
  styles: [
    `
      .board {
        background: #222227;
        color: #F4F3F0;
        border-radius: 12px;
        padding: 32px;
        font-family: Inter, system-ui, sans-serif;
      }
      .phase { margin: 0; font-size: 12px; letter-spacing: 1px; color: #6155DD; }
      h2 { margin: 8px 0 0; font-size: 24px; font-weight: 600; }
      .muted { margin: 12px 0 0; font-size: 14px; color: #ABAAA5; }
      .token { margin-top: 16px; font-size: 12px; color: #ABAAA5; }
      .ok { color: #32B173; }
      .warn { color: #E09D34; }
    `,
  ],
})
export class BoardComponent {
  constructor(public auth: AuthListenerService) {}
}
