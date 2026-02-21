import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', route: '/', exact: true },
  { icon: 'video_library', label: 'My Catalogs', route: '/catalogs', exact: false },
  { icon: 'local_library', label: 'Curated Lists', route: '/curated', exact: false },
  { icon: 'extension', label: 'Integrations', route: '/integrations', exact: false },
] as const;

@Component({
  selector: 'cc-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  readonly year = new Date().getFullYear();
  private readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly navItems = NAV_ITEMS;

  readonly isHandset = toSignal(
    this.breakpointObserver
      .observe('(max-width: 959.98px)')
      .pipe(map((r) => r.matches)),
    { initialValue: this.breakpointObserver.isMatched('(max-width: 959.98px)') },
  );

  readonly sidenavOpen = signal(false);

  ngOnInit(): void {
    this.userService.load().subscribe((profile) => {
      if (!profile.hasPassword) {
        void this.router.navigate(['/set-password']);
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
