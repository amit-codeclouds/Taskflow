import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthListenerService {
  token$ = new BehaviorSubject<string | null>(null);

  constructor() {
    window.addEventListener('auth:token', (e: Event) => {
      this.token$.next((e as CustomEvent).detail.token);
    });
    window.addEventListener('auth:logout', () => {
      this.token$.next(null);
    });
  }
}
