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
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AddonConfigItem, AddonConfigsService } from '../../../core/services/addon-configs.service';
import { LanguagesStore } from '../../../signal-store/languages.store';
import { SortOptionsStore } from '../../../signal-store/sort-options.store';

export interface CatalogFormDialogData {
  config?: AddonConfigItem;
}

export interface CatalogFormDialogResult {
  id: string;
}

function maxSelectionsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[] | null;
    if (!value || value.length <= max) return null;
    return { maxSelections: { max, actual: value.length } };
  };
}

@Component({
  selector: 'cc-catalog-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
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

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl<string>(this.data.config?.name ?? '', {
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
      nonNullable: true,
    }),
    type: new FormControl<'movie' | 'tv'>(this.data.config?.type ?? 'movie', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    languages: new FormControl<string[]>([...(this.data.config?.languages ?? [])], {
      validators: [Validators.required, maxSelectionsValidator(10)],
      nonNullable: true,
    }),
    sort: new FormControl<string>(this.data.config?.sort ?? 'popularity.desc', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

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

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);

    const payload = this.form.getRawValue();
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
