import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { LanguagesService } from '../../core/services/languages.service';
import { LanguagesActions } from './languages.actions';
import { languagesFeature } from './languages.reducer';

@Injectable()
export class LanguagesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly languagesService = inject(LanguagesService);

  readonly loadLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LanguagesActions.load),
      withLatestFrom(this.store.select(languagesFeature.selectLoaded)),
      filter(([, loaded]) => !loaded),
      switchMap(() =>
        this.languagesService.getLanguages().pipe(
          map((items) => LanguagesActions.loadSuccess({ items })),
          catchError(() => of(LanguagesActions.loadFailure())),
        ),
      ),
    ),
  );
}
