import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuratedGroupItem } from '../../core/services/curated-groups.service';
import { CuratedGroupsStore } from '../../signal-store/curated-groups.store';
import { CuratedGroupDetailDialogComponent } from './curated-group-detail-dialog/curated-group-detail-dialog.component';

@Component({
  selector: 'cc-curated-groups',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './curated-groups.component.html',
  styleUrl: './curated-groups.component.scss',
})
export class CuratedGroupsComponent implements OnInit {
  protected readonly store = inject(CuratedGroupsStore);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.store.load(true);
  }

  openDetail(group: CuratedGroupItem): void {
    this.dialog.open(CuratedGroupDetailDialogComponent, {
      data: group,
      width: '480px',
      maxWidth: '95vw',
    });
  }
}
