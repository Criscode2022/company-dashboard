import { inject } from "@angular/core";
import { CanActivateFn, Router, Routes } from "@angular/router";
import { AuthService } from "./services/auth.service";

const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAllowed = await authService.verifySession();

  if (isAllowed) {
    return true;
  }

  return router.parseUrl("/login");
};

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPage),
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./pages/signup/signup.page").then((m) => m.SignupPage),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  // TaskFlow Routes
  {
    path: "tasks",
    loadComponent: () =>
      import("./pages/tasks/tasks.page").then((m) => m.TasksPage),
    canActivate: [authGuard],
  },
  {
    path: "kanban",
    loadComponent: () =>
      import("./pages/kanban/kanban.page").then((m) => m.KanbanPage),
    canActivate: [authGuard],
  },
  {
    path: "calendar",
    loadComponent: () =>
      import("./pages/calendar/calendar.page").then((m) => m.CalendarPage),
    canActivate: [authGuard],
  },
  {
    path: "tags",
    loadComponent: () =>
      import("./pages/tags/tags.page").then((m) => m.TagsPage),
    canActivate: [authGuard],
  },
  {
    path: "activity",
    loadComponent: () =>
      import("./pages/activity/activity.page").then((m) => m.ActivityPage),
    canActivate: [authGuard],
  },
  // Existing Routes
  {
    path: "clients",
    loadComponent: () =>
      import("./pages/clients/clients.component").then(
        (m) => m.ClientsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "clients/:id",
    loadComponent: () =>
      import("./pages/client-detail/client-detail.component").then(
        (m) => m.ClientDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "projects/:id",
    loadComponent: () =>
      import("./pages/project-detail/project-detail.component").then(
        (m) => m.ProjectDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "memory",
    loadComponent: () =>
      import("./pages/memory/memory.component").then((m) => m.MemoryComponent),
    canActivate: [authGuard],
  },
  {
    path: "memory/:date",
    loadComponent: () =>
      import("./pages/memory-detail/memory-detail.component").then(
        (m) => m.MemoryDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "stats",
    loadComponent: () =>
      import("./pages/stats/stats.component").then((m) => m.StatsComponent),
    canActivate: [authGuard],
  },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "**", redirectTo: "/login" },
];
