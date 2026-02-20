import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'cc-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner aria-label="Signing you in…" />
    </div>
  `,
  styles: `
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.auth.handleCallback(token);
      void this.router.navigate(['/']);
    } else {
      void this.router.navigate(['/login']);
    }
  }
}
