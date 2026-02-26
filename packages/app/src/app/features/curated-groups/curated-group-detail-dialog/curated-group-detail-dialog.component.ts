import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CuratedGroupItem, CuratedGroupsService } from '../../../core/services/curated-groups.service';
import { CatalogsStore } from '../../../signal-store/catalogs.store';

@Component({
  selector: 'cc-curated-group-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './curated-group-detail-dialog.component.html',
  styleUrl: './curated-group-detail-dialog.component.scss',
})
export class CuratedGroupDetailDialogComponent {
  readonly data = inject<CuratedGroupItem>(MAT_DIALOG_DATA);
  private readonly service = inject(CuratedGroupsService);
  private readonly dialogRef = inject(MatDialogRef<CuratedGroupDetailDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly catalogsStore = inject(CatalogsStore);

  readonly installing = signal(false);
  readonly installUrl = signal<string | null>(null);
  readonly alreadyInstalled = signal(false);

  readonly hasUpdate = computed(() => {
    const config = this.catalogsStore.items().find(
      (c) => c.source === 'franchise-group' && c.curatedGroupId === this.data.id,
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
