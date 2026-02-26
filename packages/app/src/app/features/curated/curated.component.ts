import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuratedListItem } from '../../core/services/curated-lists.service';
import { CuratedListsStore } from '../../signal-store/curated-lists.store';
import { CatalogsStore } from '../../signal-store/catalogs.store';
import { CuratedDetailDialogComponent } from './curated-detail-dialog/curated-detail-dialog.component';

@Component({
  selector: 'cc-curated',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './curated.component.html',
  styleUrl: './curated.component.scss',
})
export class CuratedComponent implements OnInit {
  protected readonly store = inject(CuratedListsStore);
  private readonly catalogsStore = inject(CatalogsStore);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.store.load(true);
    this.catalogsStore.load();
  }

  needsUpdate(list: CuratedListItem): boolean {
    const config = this.catalogsStore.items().find(
      (c) => (c.source === 'curated-list' || c.source === 'tmdb-list') && c.tmdbListId === list.tmdbListId,
    );
    return config !== undefined && (config.installedVersion ?? 0) < list.changeVersion;
  }

  openDetail(list: CuratedListItem): void {
    this.dialog.open(CuratedDetailDialogComponent, {
      data: list,
      width: '480px',
      maxWidth: '95vw',
    });
  }
}
