import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { DailyContentPublic } from '../../core/services/daily-content.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'cc-fun-fact-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './fun-fact-dialog.component.html',
  styleUrl: './fun-fact-dialog.component.scss',
})
export class FunFactDialogComponent {
  readonly data = inject<DailyContentPublic>(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<FunFactDialogComponent>);

  optOut(): void {
    this.userService.setFunFactOptOut(true).subscribe();
    this.dialogRef.close();
  }
}
