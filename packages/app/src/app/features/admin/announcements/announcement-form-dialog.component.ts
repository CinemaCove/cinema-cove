import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnnouncementsService, type Announcement } from '../../../core/services/announcements.service';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'cc-announcement-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RichTextEditorComponent,
  ],
  template: `
    <h2 mat-dialog-title>{{ item ? 'Edit Announcement' : 'New Announcement' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          @if (form.controls.title.hasError('required')) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="state-field">
          <mat-label>State</mat-label>
          <mat-select formControlName="state">
            <mat-option value="draft">Draft</mat-option>
            <mat-option value="published">Published</mat-option>
          </mat-select>
        </mat-form-field>

        <cc-rich-text-editor
          #editor
          [initialContent]="item?.content ?? ''"
          placeholder="Write your announcement..."
          (contentChange)="onContentChange($event)"
        />
      </form>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <span class="spacer"></span>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="18" />
        } @else {
          {{ item ? 'Save' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; min-width: 480px; }
    .full-width { width: 100%; }
    .state-field { width: 200px; }
    .editor-label { font-size: 0.75rem; color: rgba(0,0,0,0.6); margin-bottom: -8px; }
    .spacer { flex: 1; }
    mat-dialog-content { overflow-y: auto; }
  `],
})
export class AnnouncementFormDialogComponent implements OnInit {
  @ViewChild('editor') editorRef?: RichTextEditorComponent;

  readonly item = inject<Announcement | null>(MAT_DIALOG_DATA);
  private readonly service = inject(AnnouncementsService);
  private readonly dialogRef = inject(MatDialogRef<AnnouncementFormDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  private content = '';

  readonly form = new FormGroup({
    title: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    state: new FormControl<'draft' | 'published'>('draft', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (this.item) {
      this.form.patchValue({ title: this.item.title, state: this.item.state });
      this.content = this.item.content;
    }
  }

  onContentChange(html: string): void {
    this.content = html;
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const { title, state } = this.form.getRawValue();
    const payload = { title, content: this.content, state };

    const done = () => { this.saving.set(false); this.dialogRef.close(true); };
    const fail = () => this.saving.set(false);

    if (this.item) {
      this.service.adminUpdate(this.item.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: done, error: fail });
    } else {
      this.service.adminCreate(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: done, error: fail });
    }
  }
}
