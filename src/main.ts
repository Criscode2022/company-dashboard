import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { RouteReuseStrategy, provideRouter } from "@angular/router";
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from "@ionic/angular/standalone";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NeonDataAuthInterceptor } from "./app/interceptors/neon-data-auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NeonDataAuthInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
