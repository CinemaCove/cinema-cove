import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntegrationsStore } from '../../signal-store/integrations.store';

@Component({
  selector: 'cc-integrations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss',
})
export class IntegrationsComponent implements OnInit {
  protected readonly store = inject(IntegrationsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.store.load();
    this.store.loadTmdbLists();

    const tmdb = this.route.snapshot.queryParamMap.get('tmdb');
    if (tmdb === 'connected') {
      this.snackBar.open('TMDB connected successfully!', undefined, { duration: 3000 });
    }
  }

  isInstalling(listType: string, type: string): boolean {
    const i = this.store.installing();
    return i?.listType === listType && i?.type === type;
  }
}
