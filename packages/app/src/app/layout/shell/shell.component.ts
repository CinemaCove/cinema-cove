import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { interval, startWith, switchMap, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { AnnouncementsService, type Announcement } from '../../core/services/announcements.service';
import { environment } from '../../../environments/environment';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', route: '/', exact: true },
  { icon: 'video_library', label: 'My Catalogs', route: '/catalogs', exact: false },
  { icon: 'local_library', label: 'Curated Lists', route: '/curated', exact: false },
  { icon: 'movie_filter', label: 'Groups', route: '/curated-groups', exact: false },
  { icon: 'extension', label: 'Integrations', route: '/integrations', exact: false },
  { icon: 'campaign', label: 'News', route: '/news', exact: false },
];

const ADMIN_NAV_ITEMS = [
  { icon: 'edit_calendar', label: 'Daily Content', route: '/admin/daily-content', exact: false },
  { icon: 'campaign', label: 'Announcements', route: '/admin/announcements', exact: false },
];

@Component({
  selector: 'cc-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    DatePipe,
    MatBadgeModule,
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
  readonly discordUrl = environment.discordUrl;
  readonly donateUrl = environment.donateUrl;
  private readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly userService = inject(UserService);
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly unreadCount = signal(0);
  readonly recentNotifs = signal<Announcement[]>([]);
  readonly notifsLoading = signal(false);

  readonly navItems = computed(() => {
    const profile = this.userService.profile();
    return profile?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;
  });

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
    interval(60_000)
      .pipe(
        startWith(0),
        switchMap(() => this.announcementsService.getUnreadCount().pipe(catchError(() => of(null)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res) this.unreadCount.set(res.count);
      });
  }

  openNotifications(): void {
    this.unreadCount.set(0);
    this.notifsLoading.set(true);
    this.announcementsService
      .getPage(null, 8)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => { this.recentNotifs.set(page.items); this.notifsLoading.set(false); },
        error: () => this.notifsLoading.set(false),
      });
    this.announcementsService.markRead().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent?.trim() ?? '';
    return text.length > 140 ? text.slice(0, 140) + '…' : text;
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
