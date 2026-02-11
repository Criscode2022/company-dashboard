import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { NeonDataAuthInterceptor } from './app/interceptors/neon-data-auth.interceptor';
import { ThemeService } from './app/services/theme.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NeonDataAuthInterceptor,
      multi: true,
    },
    ThemeService,
  ],
}).then((appRef) => {
  // Initialize theme on app startup
  const themeService = appRef.injector.get(ThemeService);
  themeService.setTheme(themeService.getCurrentTheme());
}).catch((err) => console.error(err));
