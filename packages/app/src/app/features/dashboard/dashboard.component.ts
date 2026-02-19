import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddonConfigItem } from '../../core/services/addon-configs.service';
import { CatalogsStore } from '../../signal-store/catalogs.store';

const CURATED_TEASERS = [
  {
    title: "90's Slashers",
    icon: 'movie_filter',
    gradient: 'linear-gradient(135deg, #4A0000, #B71C1C)',
  },
  {
    title: 'Classic Westerns',
    icon: 'filter_vintage',
    gradient: 'linear-gradient(135deg, #3E2000, #BF360C)',
  },
  {
    title: 'Sci-Fi Essentials',
    icon: 'rocket_launch',
    gradient: 'linear-gradient(135deg, #001A33, #0277BD)',
  },
] as const;

@Component({
  selector: 'cc-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly catalogsStore = inject(CatalogsStore);
  protected readonly curatedTeasers = CURATED_TEASERS;

  protected readonly previewCatalogs = computed(() => this.catalogsStore.items().slice(0, 3));
  protected readonly extraCount = computed(() =>
    Math.max(0, this.catalogsStore.items().length - 3),
  );
  protected readonly movieCount = computed(
    () => this.catalogsStore.items().filter((c) => c.type === 'movie').length,
  );
  protected readonly tvCount = computed(
    () => this.catalogsStore.items().filter((c) => c.type === 'tv').length,
  );

  catalogGradient(catalog: AddonConfigItem): string {
    return catalog.type === 'movie'
      ? 'linear-gradient(135deg, #0D1B3E 0%, #1A237E 60%, #4A148C 100%)'
      : 'linear-gradient(135deg, #003832 0%, #004D40 60%, #0D47A1 100%)';
  }

  ngOnInit(): void {
    this.catalogsStore.load();
  }
}
