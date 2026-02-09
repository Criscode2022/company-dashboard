import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  // TaskFlow Routes
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.page').then(m => m.TasksPage)
  },
  {
    path: 'kanban',
    loadComponent: () => import('./pages/kanban/kanban.page').then(m => m.KanbanPage)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar/calendar.page').then(m => m.CalendarPage)
  },
  {
    path: 'tags',
    loadComponent: () => import('./pages/tags/tags.page').then(m => m.TagsPage)
  },
  {
    path: 'activity',
    loadComponent: () => import('./pages/activity/activity.page').then(m => m.ActivityPage)
  },
  // Existing Routes
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent)
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./pages/client-detail/client-detail.component').then(m => m.ClientDetailComponent)
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
  },
  {
    path: 'memory',
    loadComponent: () => import('./pages/memory/memory.component').then(m => m.MemoryComponent)
  },
  {
    path: 'memory/:date',
    loadComponent: () => import('./pages/memory-detail/memory-detail.component').then(m => m.MemoryDetailComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
