import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/addon-config/addon-config.component').then(
        (m) => m.AddonConfigComponent,
      ),
  },
];
