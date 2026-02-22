import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddonConfigItem } from '../../core/services/addon-configs.service';
import { CuratedListItem } from '../../core/services/curated-lists.service';
import { CatalogsStore } from '../../signal-store/catalogs.store';
import { CuratedListsStore } from '../../signal-store/curated-lists.store';
import { IntegrationsStore } from '../../signal-store/integrations.store';
import { CuratedDetailDialogComponent } from '../curated/curated-detail-dialog/curated-detail-dialog.component';

@Component({
  selector: 'cc-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly catalogsStore = inject(CatalogsStore);
  protected readonly curatedListsStore = inject(CuratedListsStore);
  protected readonly integrationsStore = inject(IntegrationsStore);
  private readonly dialog = inject(MatDialog);

  protected readonly previewCatalogs = computed(() => this.catalogsStore.items().slice(0, 3));
  protected readonly extraCount = computed(() =>
    Math.max(0, this.catalogsStore.items().length - 3),
  );
  protected readonly movieCount = computed(
    () => this.catalogsStore.items().filter((c) => c.type === 'movie' && !this.isMixed(c)).length,
  );
  protected readonly tvCount = computed(
    () => this.catalogsStore.items().filter((c) => c.type === 'tv' && !this.isMixed(c)).length,
  );
  protected readonly mixedCount = computed(
    () => this.catalogsStore.items().filter((c) => this.isMixed(c)).length,
  );
  protected readonly previewCurated = computed(() => this.curatedListsStore.items().slice(0, 3));
  protected readonly extraCuratedCount = computed(() =>
    Math.max(0, this.curatedListsStore.items().length - 3),
  );

  isMixed(catalog: AddonConfigItem): boolean {
    return (
      (catalog.source === 'tmdb-list' && !catalog.tmdbListType) ||
      (catalog.source === 'trakt-list' && !catalog.traktListType)
    );
  }

  catalogTileStyle(catalog: AddonConfigItem): Record<string, string> {
    if (catalog.imagePath) {
      return { backgroundImage: `url('${catalog.imagePath}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (this.isMixed(catalog)) {
      return { background: 'linear-gradient(135deg, var(--mat-sys-on-tertiary-fixed) 0%, var(--mat-sys-tertiary-container) 100%)' };
    }
    return {
      background: catalog.type === 'movie'
        ? 'linear-gradient(135deg, var(--mat-sys-on-primary-fixed) 0%, var(--mat-sys-primary-container) 100%)'
        : 'linear-gradient(135deg, var(--mat-sys-on-secondary-fixed) 0%, var(--mat-sys-secondary-container) 100%)',
    };
  }

  catalogTypeLabel(catalog: AddonConfigItem): string {
    if (this.isMixed(catalog)) return 'Mixed';
    return catalog.type === 'movie' ? 'Movies' : 'TV Shows';
  }

  openCuratedDetail(list: CuratedListItem): void {
    this.dialog.open(CuratedDetailDialogComponent, {
      data: list,
      width: '480px',
      maxWidth: '95vw',
    });
  }

  ngOnInit(): void {
    this.catalogsStore.load();
    this.curatedListsStore.load(true);
    this.integrationsStore.load();
  }
}
