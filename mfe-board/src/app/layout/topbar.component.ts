import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="topbar-title">
        <span class="topbar-title-main">Kanban Board</span>
        <span class="topbar-title-sub">Visualise and manage your workflow</span>
      </div>

      <div class="topbar-actions">
        <button class="search-pill">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <span>Search board...</span>
        </button>

        <button class="icon-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.8 2 4 3.8 4 6v3.5L2.5 11h11L12 9.5V6c0-2.2-1.8-4-4-4zm-1.5 11a1.5 1.5 0 003 0"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="notification-dot"></span>
        </button>

        <div class="avatar">AC</div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      position: fixed;
      top: 0;
      left: 240px;
      right: 0;
      height: 60px;
      background: #1A1A1E;
      border-bottom: 1px solid #2C2C32;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideDown {
      from { transform: translateY(-60px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }

    .topbar-title {
      display: flex;
      flex-direction: column;
    }

    .topbar-title-main {
      font-size: 14px;
      font-weight: 600;
      color: #F4F3F0;
      line-height: 1.2;
    }

    .topbar-title-sub {
      font-size: 11px;
      color: #6E6C6A;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #2C2C32;
      border-radius: 999px;
      height: 34px;
      padding: 0 16px;
      width: 220px;
      font-size: 14px;
      color: #6E6C6A;
      transition: background 0.15s;
    }

    .search-pill:hover { background: #393940; }

    .icon-btn {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #2C2C32;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ABAAA5;
      transition: background 0.15s, transform 0.15s;
    }

    .icon-btn:hover { background: #393940; transform: scale(1.05); }

    .notification-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6155DD;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.2); }
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #261F42;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6155DD;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s;
    }

    .avatar:hover { transform: scale(1.05); }
  `]
})
export class TopbarComponent {}
