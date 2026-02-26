import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CuratedListItem, CuratedListsService } from '../../../core/services/curated-lists.service';
import { CatalogsStore } from '../../../signal-store/catalogs.store';

@Component({
  selector: 'cc-curated-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './curated-detail-dialog.component.html',
  styleUrl: './curated-detail-dialog.component.scss',
})
export class CuratedDetailDialogComponent {
  readonly data = inject<CuratedListItem>(MAT_DIALOG_DATA);
  private readonly service = inject(CuratedListsService);
  private readonly dialogRef = inject(MatDialogRef<CuratedDetailDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly catalogsStore = inject(CatalogsStore);

  readonly installing = signal(false);
  readonly installUrl = signal<string | null>(null);
  readonly alreadyInstalled = signal(false);

  readonly hasUpdate = computed(() => {
    const config = this.catalogsStore.items().find(
      (c) => (c.source === 'curated-list' || c.source === 'tmdb-list') && c.tmdbListId === this.data.tmdbListId,
    );
    return config !== undefined && (config.installedVersion ?? 0) < this.data.changeVersion;
  });

  install(): void {
    if (this.installing()) return;
    this.installing.set(true);
    this.service.install(this.data.id).subscribe({
      next: (result) => {
        this.installing.set(false);
        this.installUrl.set(result.installUrl);
        this.alreadyInstalled.set(result.alreadyInstalled);
        this.catalogsStore.load();
        if (!result.alreadyInstalled) {
          this.snackBar.open('Catalog installed!', undefined, { duration: 3000 });
        }
      },
      error: () => {
        this.installing.set(false);
        this.snackBar.open('Install failed. Please try again.', undefined, { duration: 3000 });
      },
    });
  }
}
