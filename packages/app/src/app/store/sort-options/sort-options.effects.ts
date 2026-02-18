import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SortOptionsService } from '../../core/services/sort-options.service';
import { SortOptionsActions } from './sort-options.actions';
import { sortOptionsFeature } from './sort-options.reducer';

@Injectable()
export class SortOptionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly sortOptionsService = inject(SortOptionsService);

  readonly loadSortOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SortOptionsActions.load),
      withLatestFrom(this.store.select(sortOptionsFeature.selectLoaded)),
      filter(([, loaded]) => !loaded),
      switchMap(() =>
        this.sortOptionsService.getSortOptions().pipe(
          map((items) => SortOptionsActions.loadSuccess({ items })),
          catchError(() => of(SortOptionsActions.loadFailure())),
        ),
      ),
    ),
  );
}
