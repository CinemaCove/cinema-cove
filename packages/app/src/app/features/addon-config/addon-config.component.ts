import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
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
import {
  LanguagesService,
  ConfigurationLanguage,
} from '../../core/services/languages.service';
import { SortOption, SortOptionsService } from '../../core/services/sort-options.service';
import { AddonConfigsService } from '../../core/services/addon-configs.service';
import { environment } from '../../../environments/environment';

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
  private readonly languagesService = inject(LanguagesService);
  private readonly sortOptionsService = inject(SortOptionsService);
  private readonly addonConfigsService = inject(AddonConfigsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly languages = signal<ConfigurationLanguage[]>([]);
  readonly sortOptions = signal<SortOption[]>([]);
  readonly savedId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

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
  private readonly typeValue = toSignal(
    this.form.controls.type.valueChanges,
    { initialValue: this.form.controls.type.value },
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

  ngOnInit(): void {
    this.languagesService.getLanguages().subscribe({
      next: (langs) => {
        this.languages.set(langs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.sortOptionsService.getSortOptions().subscribe({
      next: (options) => this.sortOptions.set(options),
    });

    // Reset savedId whenever any form value changes
    this.form.valueChanges.subscribe(() => {
      if (this.savedId() !== null) {
        this.savedId.set(null);
        this.saveError.set(null);
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
    this.saving.set(true);
    this.saveError.set(null);
    const { name, type, languages, sort } = this.form.getRawValue();
    this.addonConfigsService.save({ name, type, languages, sort }).subscribe({
      next: ({ id }) => {
        this.savedId.set(id);
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('Failed to save config. Are you logged in?');
        this.saving.set(false);
      },
    });
  }

  copyUrl(): void {
    const url = this.installUrl();
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Copied!', undefined, { duration: 2000 });
    });
  }

  isFormValid(): boolean {
    return this.formStatus() === 'VALID';
  }
}
