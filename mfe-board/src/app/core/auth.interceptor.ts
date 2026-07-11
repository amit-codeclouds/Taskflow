import { HttpInterceptorFn } from '@angular/common/http';

const ACCESS_COOKIE = 'taskflow_access_token';

function getAccessToken(): string | null {
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + ACCESS_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// The Cloudflare Worker routes /api/* straight to the backend gateway regardless
// of zone, so Board (a pure static SPA, no server layer of its own) can call it
// directly — it just needs to attach the shared bearer token itself.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const token = getAccessToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
