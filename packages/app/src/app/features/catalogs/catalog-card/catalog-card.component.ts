import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddonConfigItem } from '../../../core/services/addon-configs.service';
import { LanguagesStore } from '../../../signal-store/languages.store';
import { SortOptionsStore } from '../../../signal-store/sort-options.store';
@Component({
  selector: 'cc-catalog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './catalog-card.component.html',
  styleUrl: './catalog-card.component.scss',
})
export class CatalogCardComponent {
  private readonly languagesStore = inject(LanguagesStore);
  private readonly sortOptionsStore = inject(SortOptionsStore);
  private readonly snackBar = inject(MatSnackBar);

  readonly config = input.required<AddonConfigItem>();
  readonly isDeleting = input<boolean>(false);
  readonly editClicked = output<void>();
  readonly deleteClicked = output<void>();

  readonly isMixed = computed(() => {
    const c = this.config();
    return (
      (c.source === 'tmdb-list' && !c.tmdbListType) ||
      (c.source === 'trakt-list' && !c.traktListType)
    );
  });

  readonly typeLabel = computed(() => {
    if (this.isMixed()) return 'Mixed';
    return this.config().type === 'movie' ? 'Movies' : 'TV Shows';
  });

  readonly gradientStyle = computed(() => {
    const imagePath = this.config().imagePath;
    if (imagePath) {
      return { backgroundImage: `url('${imagePath}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (this.isMixed()) {
      return {
        background:
          'linear-gradient(135deg, var(--mat-sys-on-tertiary-fixed) 0%, var(--mat-sys-tertiary-container) 100%)',
      };
    }
    return {
      background:
        this.config().type === 'movie'
          ? 'linear-gradient(135deg, var(--mat-sys-on-primary-fixed) 0%, var(--mat-sys-primary-container) 100%)'
          : 'linear-gradient(135deg, var(--mat-sys-on-secondary-fixed) 0%, var(--mat-sys-secondary-container) 100%)',
    };
  });

  readonly sortLabel = computed(() => {
    const opt = this.sortOptionsStore.items().find((o) => o.value === this.config().sort);
    return opt?.label ?? this.config().sort;
  });

  readonly visibleLanguages = computed(() =>
    this.config()
      .languages.slice(0, 3)
      .map((code) => {
        const lang = this.languagesStore.items().find((l) => l.iso639_1 === code);
        return lang?.englishName ?? code.toUpperCase();
      }),
  );

  readonly hiddenCount = computed(() => Math.max(0, this.config().languages.length - 3));

  readonly installUrl = computed(() => this.config().installUrl);

  copyUrl(): void {
    void navigator.clipboard.writeText(this.installUrl()).then(() => {
      this.snackBar.open('URL copied!', undefined, { duration: 2000 });
    });
  }
}
