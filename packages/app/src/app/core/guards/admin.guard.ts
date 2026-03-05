import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const profile = userService.profile();
  if (profile?.role === 'admin') return true;
  return router.createUrlTree(['/']);
};
