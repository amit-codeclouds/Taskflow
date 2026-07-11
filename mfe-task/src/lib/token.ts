'use client';

const ACCESS_COOKIE = 'taskflow_access_token';

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + ACCESS_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAccessToken(token: string, expiresInSeconds = 900): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${expiresInSeconds}; SameSite=Lax`;
}

export function clearAccessToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
