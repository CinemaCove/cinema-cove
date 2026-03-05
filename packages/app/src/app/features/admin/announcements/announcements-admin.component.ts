import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { AnnouncementsService, type Announcement } from '../../../core/services/announcements.service';
import { AnnouncementFormDialogComponent } from './announcement-form-dialog.component';

@Component({
  selector: 'cc-announcements-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './announcements-admin.component.html',
  styleUrl: './announcements-admin.component.scss',
})
export class AnnouncementsAdminComponent implements OnInit {
  private readonly service = inject(AnnouncementsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<Announcement[]>([]);
  readonly loading = signal(false);
  readonly columns = ['title', 'state', 'publishedAt', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service
      .adminGetAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => { this.items.set(items); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  openCreate(): void {
    const ref = this.dialog.open(AnnouncementFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) this.load();
    });
  }

  openEdit(item: Announcement): void {
    const ref = this.dialog.open(AnnouncementFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: item,
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) this.load();
    });
  }

  delete(item: Announcement): void {
    if (!confirm(`Delete "${item.title}"?`)) return;
    this.service
      .adminDelete(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }
}
