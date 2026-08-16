import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isAuthenticated, redirectToLogin } from './app/core/auth.guard';

// Gate the whole app on auth BEFORE bootstrapping. If we bootstrapped first, the
// sidebar/topbar (in app.component) would render and fire the /auth/me call for a
// fraction of a second before any route guard could redirect — causing the flash.
if (isAuthenticated()) {
  bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
} else {
  redirectToLogin();
}
