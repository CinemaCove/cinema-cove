import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'catalogs',
        loadComponent: () =>
          import('./features/catalogs/catalogs.component').then(
            (m) => m.CatalogsComponent,
          ),
      },
      {
        path: 'curated',
        loadComponent: () =>
          import('./features/curated/curated.component').then(
            (m) => m.CuratedComponent,
          ),
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./features/integrations/integrations.component').then(
            (m) => m.IntegrationsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'set-password',
        loadComponent: () =>
          import('./features/set-password/set-password.component').then(
            (m) => m.SetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/privacy/privacy.component').then(
        (m) => m.PrivacyComponent,
      ),
  },
  {
    path: 'data-deletion',
    loadComponent: () =>
      import('./features/data-deletion/data-deletion.component').then(
        (m) => m.DataDeletionComponent,
      ),
  },
];
