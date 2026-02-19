import {
  Component,
  OnInit,
  computed,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
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
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { LanguagesStore } from '../../signal-store/languages.store';
import { SortOptionsStore } from '../../signal-store/sort-options.store';
import { AddonConfigStore } from '../../signal-store/addon-config.store';

function maxSelectionsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[] | null;
    if (!value || value.length <= max) return null;
    return { maxSelections: { max, actual: value.length } };
  };
}

@Component({
  selector: 'cc-addon-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './addon-config.component.html',
  styleUrl: './addon-config.component.scss',
})
export class AddonConfigComponent implements OnInit {
  private readonly languagesStore = inject(LanguagesStore);
  private readonly sortOptionsStore = inject(SortOptionsStore);
  private readonly addonConfigStore = inject(AddonConfigStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly languages = this.languagesStore.items;
  readonly sortOptions = this.sortOptionsStore.items;
  readonly loading = this.languagesStore.loading;
  readonly savedId = this.addonConfigStore.savedId;
  readonly saveError = this.addonConfigStore.error;

  readonly saving = computed(() => this.addonConfigStore.status() === 'saving');

  readonly form = new FormGroup({
    name: new FormControl<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
      nonNullable: true,
    }),
    type: new FormControl<'movie' | 'tv'>('movie', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    languages: new FormControl<string[]>([], {
      validators: [Validators.required, maxSelectionsValidator(10)],
      nonNullable: true,
    }),
    sort: new FormControl<string>('popularity.desc', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  private readonly nameValue = toSignal(
    this.form.controls.name.valueChanges,
    { initialValue: this.form.controls.name.value },
  );

  protected readonly selectedLanguages = toSignal(
    this.form.controls.languages.valueChanges,
    { initialValue: this.form.controls.languages.value },
  );
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  readonly addonName = computed(
    () => `CinemaCove-${this.nameValue() || '...'}`,
  );

  readonly maxReached = computed(
    () => this.selectedLanguages().length >= 10,
  );

  readonly installUrl = computed(() => {
    const id = this.savedId();
    if (!id) return '';
    const apiHost = new URL(environment.apiUrl || window.location.origin).host;
    return `stremio://${apiHost}/${id}/manifest.json`;
  });

  readonly isFormValid = computed(() => this.formStatus() === 'VALID');

  ngOnInit(): void {
    this.languagesStore.load();
    this.sortOptionsStore.load();

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.savedId() !== null) {
          this.addonConfigStore.resetSaved();
        }
      });
  }

  isSelected(code: string): boolean {
    return this.selectedLanguages().includes(code);
  }

  getLanguageName(code: string): string {
    const lang = this.languages().find((l) => l.iso639_1 === code);
    return lang?.englishName || lang?.name || code;
  }

  removeLanguage(code: string): void {
    const current = this.form.controls.languages.value;
    this.form.controls.languages.setValue(current.filter((c) => c !== code));
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const { name, type, languages, sort } = this.form.getRawValue();
    this.addonConfigStore.save({ name, type, languages, sort });
  }

  copyUrl(): void {
    const url = this.installUrl();
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Copied!', undefined, { duration: 2000 });
    });
  }
}
