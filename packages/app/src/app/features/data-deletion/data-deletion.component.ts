import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cc-data-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './data-deletion.component.html',
  styleUrl: './data-deletion.component.scss',
})
export class DataDeletionComponent {
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
