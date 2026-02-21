import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { AddonConfigItem, AddonConfigPayload, AddonConfigsService } from '../../../core/services/addon-configs.service';
import { LanguagesStore } from '../../../signal-store/languages.store';
import { SortOptionsStore } from '../../../signal-store/sort-options.store';

export interface CatalogFormDialogData {
  config?: AddonConfigItem;
}

export interface CatalogFormDialogResult {
  id: string;
}

const YEAR_FORMATS: MatDateFormats = {
  parse: { dateInput: { year: 'numeric' } as Intl.DateTimeFormatOptions },
  display: {
    dateInput: { year: 'numeric' } as Intl.DateTimeFormatOptions,
    monthYearLabel: { year: 'numeric', month: 'short' } as Intl.DateTimeFormatOptions,
    dateA11yLabel: { year: 'numeric' } as Intl.DateTimeFormatOptions,
    monthYearA11yLabel: { year: 'numeric', month: 'long' } as Intl.DateTimeFormatOptions,
  },
};

function maxSelectionsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[] | null;
    if (!value || value.length <= max) return null;
    return { maxSelections: { max, actual: value.length } };
  };
}

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('releaseDateFrom')?.value as Date | null;
  const to = group.get('releaseDateTo')?.value as Date | null;
  if (from && to && from.getTime() > to.getTime()) {
    return { dateRange: true };
  }
  return null;
}

const VOTE_COUNT_PRESETS = [50, 100, 200, 300, 500, 1000] as const;

function yearToDate(year: number | null | undefined): Date | null {
  return year != null ? new Date(year, 0, 1) : null;
}

@Component({
  selector: 'cc-catalog-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MAT_DATE_FORMATS, useValue: YEAR_FORMATS }],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './catalog-form-dialog.component.html',
  styleUrl: './catalog-form-dialog.component.scss',
})
export class CatalogFormDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CatalogFormDialogComponent, CatalogFormDialogResult>);
  private readonly data = inject<CatalogFormDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(AddonConfigsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly languagesStore = inject(LanguagesStore);
  protected readonly sortOptionsStore = inject(SortOptionsStore);

  readonly isEditMode = !!this.data.config;
  readonly title = this.isEditMode ? 'Edit Catalog' : 'New Catalog';
  readonly voteCountPresets = VOTE_COUNT_PRESETS;

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = new FormGroup(
    {
      name: new FormControl<string>(this.data.config?.name ?? '', {
        validators: [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9_ -]+$/),
        ],
        nonNullable: true,
      }),
      type: new FormControl<'movie' | 'tv'>(this.data.config?.type ?? 'movie', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      languages: new FormControl<string[]>([...(this.data.config?.languages ?? [])], {
        validators: [maxSelectionsValidator(10)],
        nonNullable: true,
      }),
      sort: new FormControl<string>(this.data.config?.sort ?? 'popularity.desc', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      includeAdult: new FormControl<boolean>(this.data.config?.includeAdult ?? false, {
        nonNullable: true,
      }),
      minVoteAverage: new FormControl<number | null>(this.data.config?.minVoteAverage ?? null, {
        validators: [Validators.min(0), Validators.max(10)],
      }),
      minVoteCount: new FormControl<number | null>(this.data.config?.minVoteCount ?? null),
      releaseDateFrom: new FormControl<Date | null>(yearToDate(this.data.config?.releaseDateFrom)),
      releaseDateTo: new FormControl<Date | null>(yearToDate(this.data.config?.releaseDateTo)),
    },
    { validators: [dateRangeValidator] },
  );

  protected readonly selectedLanguages = toSignal(
    this.form.controls.languages.valueChanges,
    { initialValue: this.form.controls.languages.value },
  );

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  readonly maxReached = computed(() => this.selectedLanguages().length >= 10);
  readonly isFormValid = computed(() => this.formStatus() === 'VALID');

  ngOnInit(): void {
    this.languagesStore.load();
    this.sortOptionsStore.load();
  }

  isSelected(code: string): boolean {
    return this.selectedLanguages().includes(code);
  }

  getLanguageName(code: string): string {
    const lang = this.languagesStore.items().find((l) => l.iso639_1 === code);
    return lang?.englishName || lang?.name || code;
  }

  removeLanguage(code: string): void {
    const current = this.form.controls.languages.value;
    this.form.controls.languages.setValue(current.filter((c) => c !== code));
  }

  onYearSelected(year: Date, picker: MatDatepicker<Date>, controlName: 'releaseDateFrom' | 'releaseDateTo'): void {
    this.form.controls[controlName].setValue(new Date(year.getFullYear(), 0, 1));
    this.form.controls[controlName].markAsDirty();
    picker.close();
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);

    const raw = this.form.getRawValue();
    const payload: AddonConfigPayload = {
      name: raw.name,
      type: raw.type,
      languages: raw.languages,
      sort: raw.sort,
      includeAdult: raw.includeAdult,
      minVoteAverage: raw.minVoteAverage,
      minVoteCount: raw.minVoteCount,
      releaseDateFrom: raw.releaseDateFrom instanceof Date ? raw.releaseDateFrom.getFullYear() : null,
      releaseDateTo: raw.releaseDateTo instanceof Date ? raw.releaseDateTo.getFullYear() : null,
    };

    const request$ = this.isEditMode
      ? this.service.update(this.data.config!.id, payload)
      : this.service.create(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => this.dialogRef.close({ id }),
      error: () => {
        this.saveError.set('Failed to save. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
