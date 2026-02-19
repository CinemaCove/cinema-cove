import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddonConfigItem } from '../../core/services/addon-configs.service';
import { CatalogsStore } from '../../signal-store/catalogs.store';
import { LanguagesStore } from '../../signal-store/languages.store';
import { SortOptionsStore } from '../../signal-store/sort-options.store';
import { CatalogCardComponent } from './catalog-card/catalog-card.component';
import {
  CatalogFormDialogComponent,
  CatalogFormDialogResult,
} from './catalog-form-dialog/catalog-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'cc-catalogs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CatalogCardComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.scss',
})
export class CatalogsComponent implements OnInit {
  protected readonly catalogsStore = inject(CatalogsStore);
  private readonly languagesStore = inject(LanguagesStore);
  private readonly sortOptionsStore = inject(SortOptionsStore);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.catalogsStore.load();
    this.languagesStore.load();
    this.sortOptionsStore.load();
  }

  openFormDialog(config?: AddonConfigItem): void {
    this.dialog
      .open<CatalogFormDialogComponent, { config?: AddonConfigItem }, CatalogFormDialogResult>(
        CatalogFormDialogComponent,
        { data: { config }, width: '560px', maxWidth: '95vw' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.id) this.catalogsStore.load();
      });
  }

  openDeleteConfirm(config: AddonConfigItem): void {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        data: {
          title: 'Delete Catalog',
          message: `Delete "${config.name}"? This cannot be undone.`,
          confirmLabel: 'Delete',
        },
        width: '400px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.catalogsStore.deleteItem(config.id);
      });
  }
}
