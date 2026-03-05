import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnnouncementsService, type Announcement } from '../../core/services/announcements.service';

@Component({
  selector: 'cc-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
})
export class NewsComponent implements OnInit, AfterViewInit {
  @ViewChild('sentinel') sentinelRef!: ElementRef<HTMLDivElement>;

  private readonly service = inject(AnnouncementsService);
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  readonly items = signal<Announcement[]>([]);
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly error = signal(false);
  private cursor: string | null = null;

  ngOnInit(): void {
    this.service.markRead().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.loading()) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    this.observer.observe(this.sentinelRef.nativeElement);
  }

  private loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.loading.set(true);
    this.error.set(false);

    this.service
      .getPage(this.cursor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.items.update((prev) => [...prev, ...page.items]);
          this.cursor = page.nextCursor;
          this.hasMore.set(page.hasMore);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }
}
