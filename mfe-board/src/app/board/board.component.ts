import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="board">
      <h2>Board MFE (Angular · 4200)</h2>
      <p class="muted">Placeholder. Phase 2 will add the Kanban board with CDK drag-and-drop and NgRx state.</p>
      <p class="token">
        Auth token from Shell:
        <span *ngIf="token; else waiting" class="ok">received</span>
        <ng-template #waiting><span class="warn">waiting…</span></ng-template>
      </p>
    </section>
  `,
  styles: [
    `
      .board {
        border: 1px solid #2a2a2a;
        background: #111;
        color: #f4f3f0;
        border-radius: 12px;
        padding: 24px;
      }
      h2 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
      .muted { color: #9a9a9a; font-size: 14px; }
      .token { font-size: 12px; color: #888; margin-top: 12px; }
      .ok { color: #32B173; }
      .warn { color: #E09D34; }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  token: string | null = null;
  private onToken = (e: Event) => {
    const ce = e as CustomEvent<{ token: string }>;
    this.token = ce.detail.token;
  };
  private onLogout = () => (this.token = null);

  private onMessage = (e: MessageEvent) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'auth:token' && e.data.detail?.token) {
      this.token = e.data.detail.token;
    } else if (e.data.type === 'auth:logout') {
      this.token = null;
    }
  };

  ngOnInit(): void {
    window.addEventListener('auth:token', this.onToken);
    window.addEventListener('auth:logout', this.onLogout);
    window.addEventListener('message', this.onMessage);
  }
  ngOnDestroy(): void {
    window.removeEventListener('auth:token', this.onToken);
    window.removeEventListener('auth:logout', this.onLogout);
    window.removeEventListener('message', this.onMessage);
  }
}
