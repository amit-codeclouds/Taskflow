import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor],
  template: `
    <aside class="sidebar">
      <div class="sidebar-accent-bar"></div>

      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3h10M2 7h6M2 11h8" stroke="white" stroke-width="1.75" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="logo-text">Taskflow</span>
      </div>

      <div class="sidebar-divider"></div>

      <div class="sidebar-section-label">Workspace</div>

      <nav class="sidebar-nav">
        <a href="/" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V6.5z"
              stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <span>Home</span>
        </a>
        <a href="/tasks" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/>
            <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="currentColor" stroke-width="1.3"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>My Tasks</span>
        </a>
        <a href="/board" class="nav-item nav-item--active">
          <div class="nav-item-indicator"></div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          <span>Kanban Board</span>
        </a>
      </nav>

      <div class="sidebar-divider" style="margin: 16px;"></div>

      <div class="sidebar-section-label">Projects</div>

      <div class="sidebar-projects">
        <div class="project-item" *ngFor="let p of projects">
          <span class="project-dot" [style.background]="p.color"></span>
          <span class="project-name">{{ p.name }}</span>
        </div>
      </div>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-divider"></div>

      <div class="sidebar-user">
        <div class="user-avatar">AC</div>
        <div class="user-info">
          <span class="user-name">Arkabrata</span>
          <span class="user-role">Engineer</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 240px;
      height: 100vh;
      background: #1A1A1E;
      display: flex;
      flex-direction: column;
      z-index: 50;
      overflow: hidden;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideIn {
      from { transform: translateX(-240px); }
      to { transform: translateX(0); }
    }

    .sidebar-accent-bar {
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: #6155DD;
    }

    .sidebar-logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px;
      flex-shrink: 0;
    }

    .logo-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #6155DD;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-text {
      color: #F4F3F0;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.02em;
    }

    .sidebar-divider {
      height: 1px;
      background: #2C2C32;
      margin: 0 16px;
      flex-shrink: 0;
    }

    .sidebar-section-label {
      padding: 20px 20px 8px;
      font-size: 11px;
      color: #6E6C6A;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 8px;
    }

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      height: 44px;
      padding: 0 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #ABAAA5;
      transition: background 0.15s, color 0.15s, transform 0.15s;
    }

    .nav-item:hover {
      background: #222227;
      color: #F4F3F0;
      transform: translateX(4px);
    }

    .nav-item--active {
      background: #261F42;
      color: #766BE8;
      font-weight: 500;
    }

    .nav-item--active:hover {
      transform: none;
    }

    .nav-item-indicator {
      position: absolute;
      left: 0;
      top: 14%;
      height: 72%;
      width: 3px;
      background: #6155DD;
      border-radius: 0 4px 4px 0;
    }

    .sidebar-projects {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 20px;
    }

    .project-item {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 32px;
      font-size: 14px;
      color: #ABAAA5;
    }

    .project-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .project-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-spacer { flex: 1; }

    .sidebar-user {
      height: 68px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      flex-shrink: 0;
    }

    .user-avatar {
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
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #F4F3F0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: #6E6C6A;
    }
  `]
})
export class SidebarComponent {
  projects = [
    { name: 'Taskflow App',  color: '#6155DD' },
    { name: 'Design System', color: '#32B173' },
    { name: 'API Gateway',   color: '#E09D34' },
  ];
}
