import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AddonConfigsService } from '../../core/services/addon-configs.service';
import { AddonConfigActions } from './addon-config.actions';

@Injectable()
export class AddonConfigEffects {
  private readonly actions$ = inject(Actions);
  private readonly addonConfigsService = inject(AddonConfigsService);

  readonly saveAddonConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AddonConfigActions.save),
      switchMap(({ name, contentType, languages, sort }) =>
        this.addonConfigsService.save({ name, type: contentType, languages: [...languages], sort }).pipe(
          map(({ id }) => AddonConfigActions.saveSuccess({ id })),
          catchError(() => of(AddonConfigActions.saveFailure({ error: 'Failed to save config. Are you logged in?' }))),
        ),
      ),
    ),
  );
}
