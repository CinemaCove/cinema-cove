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
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly languages = signal<ConfigurationLanguage[]>([]);
  readonly sortOptions = signal<SortOption[]>([]);

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
  private readonly sortValue = toSignal(
    this.form.controls.sort.valueChanges,
    { initialValue: this.form.controls.sort.value },
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
    if (this.formStatus() !== 'VALID') return '';
    const name = this.nameValue();
    const type = this.typeValue();
    const languages = this.selectedLanguages();
    const sort = this.sortValue();
    if (!name || !type || !languages.length) return '';
    const config = { name, type, languages, sort };
    const encoded = btoa(JSON.stringify(config));
    const apiHost = new URL(environment.apiUrl || window.location.origin).host;
    return `stremio://${apiHost}/${encoded}/manifest.json`;
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

  copyUrl(): void {
    const url = this.installUrl();
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Copied!', undefined, { duration: 2000 });
    });
  }
}
