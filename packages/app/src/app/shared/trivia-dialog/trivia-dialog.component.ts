import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { DailyContentPublic } from '../../core/services/daily-content.service';

const TRIVIA_DURATION_SECONDS = 30;

type TriviaState = 'question' | 'correct' | 'wrong' | 'timeout';

@Component({
  selector: 'cc-trivia-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './trivia-dialog.component.html',
  styleUrl: './trivia-dialog.component.scss',
})
export class TriviaDialogComponent implements OnInit {
  readonly data = inject<DailyContentPublic>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TriviaDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);

  readonly secondsLeft = signal(TRIVIA_DURATION_SECONDS);
  readonly progress = computed(() => (this.secondsLeft() / TRIVIA_DURATION_SECONDS) * 100);
  readonly state = signal<TriviaState>('question');
  readonly selectedIndex = signal<number | null>(null);

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const left = this.secondsLeft() - 1;
        this.secondsLeft.set(left);
        if (left <= 0 && this.state() === 'question') {
          this.state.set('timeout');
        }
      });
  }

  answer(index: number): void {
    if (this.state() !== 'question') return;
    this.selectedIndex.set(index);
    if (index === this.data.correctChoiceIndex) {
      this.state.set('correct');
    } else {
      this.state.set('wrong');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
