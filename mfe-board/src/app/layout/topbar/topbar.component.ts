import { Component, ElementRef, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgIf, AvatarComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  open = false;
  loggingOut = false;
  title = 'My Boards';
  subtitle = 'All your team boards';

  constructor(
    public auth: AuthService,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>
  ) {
    this.auth.ensureLoaded();
    this.updatePageInfo(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updatePageInfo(e.urlAfterRedirects));
  }

  private updatePageInfo(url: string) {
    const path = url.split('?')[0].replace(/^\/board/, '');
    if (path === '' || path === '/') {
      this.title = 'My Boards';
      this.subtitle = 'All your team boards';
    } else {
      this.title = 'Kanban Board';
      this.subtitle = 'Visualise and manage your workflow';
    }
  }

  toggleDropdown() {
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }

  async logout() {
    this.loggingOut = true;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }
}
