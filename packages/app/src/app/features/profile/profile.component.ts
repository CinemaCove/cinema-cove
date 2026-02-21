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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'cc-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = this.userService.profile;

  readonly savingName = signal(false);
  readonly nameSuccess = signal(false);
  readonly nameError = signal<string | null>(null);

  readonly savingPassword = signal(false);
  readonly passwordSuccess = signal(false);
  readonly passwordError = signal<string | null>(null);

  readonly nameForm = new FormGroup({
    displayName: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    }),
  });

  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true }),
    newPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)],
      nonNullable: true,
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    const p = this.profile();
    if (p) {
      this.nameForm.controls.displayName.setValue(p.displayName ?? '');
    } else {
      this.userService.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
        this.nameForm.controls.displayName.setValue(p.displayName ?? '');
      });
    }
  }

  saveName(): void {
    if (this.nameForm.invalid || this.savingName()) return;
    this.savingName.set(true);
    this.nameError.set(null);
    this.nameSuccess.set(false);

    const { displayName } = this.nameForm.getRawValue();
    this.userService
      .updateDisplayName(displayName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingName.set(false);
          this.nameSuccess.set(true);
        },
        error: () => {
          this.savingName.set(false);
          this.nameError.set('Failed to update name. Please try again.');
        },
      });
  }

  savePassword(): void {
    const raw = this.passwordForm.getRawValue();
    if (raw.newPassword !== raw.confirmPassword) {
      this.passwordError.set('Passwords do not match.');
      return;
    }
    if (this.passwordForm.invalid || this.savingPassword()) return;
    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const currentPassword = this.profile()?.hasPassword ? raw.currentPassword : null;
    this.userService
      .setPassword(currentPassword, raw.newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
        },
        error: (err) => {
          this.savingPassword.set(false);
          const msg = err?.error?.message;
          this.passwordError.set(
            typeof msg === 'string' ? msg : 'Failed to update password. Please try again.',
          );
        },
      });
  }
}
