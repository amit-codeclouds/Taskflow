import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

const ACCESS_COOKIE = 'taskflow_access_token';
export const API_URL = 'https://taskflowbackend-50mh.onrender.com/api';

// Loose bag the caller can pass as `params` — values get funnelled into
// HttpParams, so undefined/null entries are dropped rather than serialised
// as the literal strings "undefined"/"null".
export type ParamValue = string | number | boolean;
export type ParamsInput =
  | HttpParams
  | Record<string, ParamValue | ParamValue[] | null | undefined>;

export type HeadersInput = HttpHeaders | Record<string, string | string[]>;

export interface RequestOptions {
  /** Query string params. Plain objects are converted to HttpParams. */
  params?: ParamsInput;
  /** Extra headers merged on top of the auth header. */
  headers?: HeadersInput;
  /** Send cross-site cookies with the request. */
  withCredentials?: boolean;
  /** Angular HttpContext for interceptor coordination. */
  context?: HttpContext;
  /**
   * Attach the bearer token from the access-token cookie. Defaults to true.
   * Set false for calls that must go out anonymously.
   */
  auth?: boolean;
}

/**
 * Thin, generic wrapper over Angular's HttpClient.
 *
 * Every verb takes a dynamic `url` plus optional `params`/`headers`, and by
 * default attaches the shared access token (read from the `taskflow_access_token`
 * cookie) as an `Authorization: Bearer` header. The Cloudflare Worker routes
 * `/api/*` straight to the backend gateway, so callers pass relative URLs
 * (e.g. `this.api.get('/api/boards')`).
 *
 * Note: a global `authInterceptor` also attaches this token on `/api/*` requests;
 * this service reads the cookie directly so it stays self-contained and works even
 * for absolute URLs the interceptor deliberately ignores.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(url, this.buildOptions(options));
  }

  post<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(url, body ?? null, this.buildOptions(options));
  }

  put<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(url, body ?? null, this.buildOptions(options));
  }

  patch<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(url, body ?? null, this.buildOptions(options));
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(url, this.buildOptions(options));
  }

  // For endpoints that return a raw file (e.g. the CSV/XLSX export) rather than
  // the standard JSON envelope — 'blob' has to be a literal here for HttpClient's
  // overload resolution to return Observable<Blob> instead of Observable<Object>.
  postBlob(url: string, body?: unknown, options?: RequestOptions): Observable<Blob> {
    return this.http.post(url, body ?? null, {
      ...this.buildOptions(options),
      responseType: 'blob' as const,
    });
  }

  // Normalises the loose RequestOptions into the concrete shape HttpClient wants:
  // HttpParams, HttpHeaders (with the bearer token folded in), and passthrough flags.
  private buildOptions(options: RequestOptions = {}) {
    return {
      params: this.buildParams(options.params),
      headers: this.buildHeaders(options.headers, options.auth !== false),
      context: options.context,
      withCredentials: options.withCredentials,
    };
  }

  private buildParams(params?: ParamsInput): HttpParams {
    if (params instanceof HttpParams) return params;

    let httpParams = new HttpParams();
    if (!params) return httpParams;

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) httpParams = httpParams.append(key, String(item));
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  private buildHeaders(headers: HeadersInput | undefined, withAuth: boolean): HttpHeaders {
    let httpHeaders = headers instanceof HttpHeaders ? headers : new HttpHeaders();

    if (headers && !(headers instanceof HttpHeaders)) {
      for (const [key, value] of Object.entries(headers)) {
        httpHeaders = httpHeaders.set(key, value);
      }
    }

    if (withAuth && !httpHeaders.has('Authorization')) {
      const token = this.getAccessToken();
      if (token) httpHeaders = httpHeaders.set('Authorization', `Bearer ${token}`);
    }

    return httpHeaders;
  }

  private getAccessToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(
      new RegExp('(?:^|;)\\s*' + ACCESS_COOKIE + '=([^;]+)'),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }
}
