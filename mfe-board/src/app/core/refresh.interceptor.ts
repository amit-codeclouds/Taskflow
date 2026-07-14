import {
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

const ACCESS_COOKIE = 'taskflow_access_token';
const REFRESH_COOKIE = 'taskflow_refresh_token';

// PATCH /api/auth/refresh — body: { refreshToken: <previous refresh token> }.
const REFRESH_URL = '/api/auth/refresh';

// Marks a request already retried after a refresh, so a second 401 on it does NOT
// trigger another refresh (prevents infinite loops).
const RETRIED = new HttpContextToken<boolean>(() => false);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

// Seconds until a JWT expires (exp - iat); falls back to 1h if it can't be parsed.
function jwtTtl(jwt: string): number {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return typeof payload.exp === 'number' && typeof payload.iat === 'number'
      ? payload.exp - payload.iat
      : 3600;
  } catch {
    return 3600;
  }
}

function withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    context: req.context.set(RETRIED, true),
  });
}

// Single-flight refresh: while one refresh is in flight, every other 401 waits on
// the same observable instead of firing its own. Reset once it settles.
let refresh$: Observable<string> | null = null;

function refreshToken(http: HttpClient): Observable<string> {
  if (!refresh$) {
    const previousRefreshToken = getCookie(REFRESH_COOKIE);

    refresh$ = http
      .patch<{ result?: { token?: string; refreshToken?: string } }>(
        REFRESH_URL,
        { refreshToken: previousRefreshToken },
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          const token = res?.result?.token ?? '';
          // Persist the new tokens so retries and later requests use them.
          if (token) setCookie(ACCESS_COOKIE, token, jwtTtl(token));
          const newRefresh = res?.result?.refreshToken;
          if (newRefresh) setCookie(REFRESH_COOKIE, newRefresh, 60 * 60 * 24 * 7);
          return token;
        }),
        finalize(() => { refresh$ = null; }),
        shareReplay(1),
      );
  }
  return refresh$;
}

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/api/auth/');   // never refresh the auth calls themselves
      const alreadyRetried = req.context.get(RETRIED);

      if (error.status !== 401 || isAuthCall || alreadyRetried) {
        return throwError(() => error);
      }
      return handle401(req, next, http, error);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  http: HttpClient,
  original: HttpErrorResponse,
): Observable<HttpEvent<unknown>> {
  return refreshToken(http).pipe(
    switchMap(token => {
      if (!token) return throwError(() => original);
      return next(withToken(req, token));   // retry the original request with the new token
    }),
    catchError(err => {
      // Refresh failed → session is gone. Send the user to login (the Shell owns it).
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return throwError(() => err);
    }),
  );
}
