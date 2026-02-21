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
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'cc-set-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss',
})
export class SetPasswordComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = this.userService.profile;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
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
    // If user already has a password, they shouldn't be here
    const p = this.profile();
    if (p?.hasPassword) {
      void this.router.navigate(['/']);
    }
  }

  save(): void {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    this.userService
      .setPassword(null, newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message;
          this.error.set(typeof msg === 'string' ? msg : 'Failed to set password. Please try again.');
        },
      });
  }
}
