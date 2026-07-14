import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { refreshTokenInterceptor } from './core/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // authInterceptor attaches the bearer token on the way out; refreshTokenInterceptor
    // wraps the response and, on 401, refreshes the token once and retries.
    provideHttpClient(withInterceptors([authInterceptor, refreshTokenInterceptor])),
  ]
};
