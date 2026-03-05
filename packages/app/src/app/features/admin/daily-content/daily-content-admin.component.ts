import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import {
  DailyContentItem,
  DailyContentService,
  DailyContentType,
} from '../../../core/services/daily-content.service';
import { UploadsService } from '../../../core/services/uploads.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'cc-daily-content-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(paste)': 'onPaste($event)' },
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatTimepickerModule,
    DatePipe,
  ],
  templateUrl: './daily-content-admin.component.html',
  styleUrl: './daily-content-admin.component.scss',
})
export class DailyContentAdminComponent implements OnInit {
  private readonly service = inject(DailyContentService);
  private readonly uploadsService = inject(UploadsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<DailyContentItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);

  readonly displayedColumns = ['type', 'title', 'publishAt', 'actions'];

  readonly form = new FormGroup({
    type: new FormControl<DailyContentType>('trivia', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    title: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    question: new FormControl('', { nonNullable: true }),
    choice0: new FormControl('', { nonNullable: true }),
    choice1: new FormControl('', { nonNullable: true }),
    choice2: new FormControl('', { nonNullable: true }),
    choice3: new FormControl('', { nonNullable: true }),
    correctChoiceIndex: new FormControl<number | null>(null),
    explanation: new FormControl('', { nonNullable: true }),
    content: new FormControl('', { nonNullable: true }),
    imageUrl: new FormControl('', { nonNullable: true }),
    publishAtDate: new FormControl<Date | null>(this.tomorrow(), Validators.required),
    publishAtTime: new FormControl<Date | null>(this.midnight()),
    expiresAtDate: new FormControl<Date | null>(null),
    expiresAtTime: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.loading.set(true);
    this.service
      .listAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load content.');
          this.loading.set(false);
        },
      });
  }

  private tomorrow(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private midnight(): Date {
    const d = new Date(0);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toDateAndTime(iso: string | undefined): { date: Date | null; time: Date | null } {
    if (!iso) return { date: null, time: null };
    const d = new Date(iso);
    const time = new Date(0);
    time.setHours(d.getHours(), d.getMinutes(), 0, 0);
    return { date: d, time };
  }

  private combineDateTime(date: Date | null, time: Date | null): string | undefined {
    if (!date) return undefined;
    const combined = new Date(date);
    combined.setHours(time?.getHours() ?? 0, time?.getMinutes() ?? 0, 0, 0);
    return combined.toISOString();
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (!item.type.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (!file) continue;
      event.preventDefault();
      this.uploadFile(file);
      break;
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.uploading.set(true);
    this.error.set(null);
    this.uploadsService
      .uploadImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ url }) => {
          this.form.controls.imageUrl.setValue(url);
          this.uploading.set(false);
        },
        error: () => {
          this.error.set('Image upload failed.');
          this.uploading.set(false);
        },
      });
  }

  editItem(item: DailyContentItem): void {
    this.editingId.set(item.id);
    const pub = this.toDateAndTime(item.publishAt);
    const exp = this.toDateAndTime(item.expiresAt);
    this.form.setValue({
      type: item.type,
      title: item.title,
      question: item.question ?? '',
      choice0: item.choices?.[0] ?? '',
      choice1: item.choices?.[1] ?? '',
      choice2: item.choices?.[2] ?? '',
      choice3: item.choices?.[3] ?? '',
      correctChoiceIndex: item.correctChoiceIndex ?? null,
      explanation: item.explanation ?? '',
      content: item.content ?? '',
      imageUrl: item.imageUrl ?? '',
      publishAtDate: pub.date,
      publishAtTime: pub.time,
      expiresAtDate: exp.date,
      expiresAtTime: exp.time,

    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ type: 'trivia', publishAtDate: this.tomorrow(), publishAtTime: this.midnight() });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const isTrivia = raw.type === 'trivia';
    const publishAt = this.combineDateTime(raw.publishAtDate, raw.publishAtTime);
    if (!publishAt) { this.saving.set(false); return; }

    const payload = {
      type: raw.type,
      title: raw.title,
      question: isTrivia ? raw.question || undefined : undefined,
      choices: isTrivia ? [raw.choice0, raw.choice1, raw.choice2, raw.choice3] : undefined,
      correctChoiceIndex: isTrivia && raw.correctChoiceIndex !== null
        ? Number(raw.correctChoiceIndex)
        : undefined,
      explanation: isTrivia ? raw.explanation || undefined : undefined,
      content: raw.content || undefined,
      imageUrl: raw.imageUrl || undefined,
      publishAt,
      expiresAt: this.combineDateTime(raw.expiresAtDate, raw.expiresAtTime),
    };

    const id = this.editingId();
    if (id) {
      this.service
        .update(id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { this.saving.set(false); this.editingId.set(null); this.form.reset({ type: 'trivia', publishAtDate: this.tomorrow(), publishAtTime: this.midnight() }); this.loadItems(); },
          error: () => { this.saving.set(false); this.error.set('Failed to save content.'); },
        });
    } else {
      this.service
        .create(payload as Parameters<typeof this.service.create>[0])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { this.saving.set(false); this.form.reset({ type: 'trivia', publishAtDate: this.tomorrow(), publishAtTime: this.midnight() }); this.loadItems(); },
          error: () => { this.saving.set(false); this.error.set('Failed to save content.'); },
        });
    }
  }

  deleteItem(item: DailyContentItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Content',
        message: `Delete "${item.title}"? This cannot be undone.`,
        confirmLabel: 'Delete',
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.service
          .delete(item.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: () => this.loadItems() });
      });
  }
}
