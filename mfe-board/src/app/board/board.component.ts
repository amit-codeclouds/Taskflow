import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  standalone: true,
  template: `
    <main style="padding: 32px 40px; font-family: Inter, system-ui, sans-serif; color: #F4F3F0;">
      <p style="margin: 0; font-size: 12px; letter-spacing: 1px; color: #6155DD; text-transform: uppercase;">
        Phase 0 · Multi-Zones Foundation
      </p>
      <h1 style="margin: 8px 0 0; font-size: 32px; font-weight: 600;">
        Kanban Board
      </h1>
      <div style="margin-top: 24px; background: #222227; border-radius: 12px; padding: 24px 32px; font-size: 14px; color: #ABAAA5;">
        Board coming in Phase 2
      </div>
    </main>
  `,
})
export class BoardComponent {}
