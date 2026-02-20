import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AddonConfigsService } from '../core/services/addon-configs.service';

interface AddonConfigState {
  readonly savedId: string | null;
  readonly status: 'idle' | 'saving' | 'saved' | 'error';
  readonly error: string | null;
}

export interface SaveAddonConfigPayload {
  name: string;
  type: 'movie' | 'tv';
  languages: readonly string[];
  sort: string;
  includeAdult?: boolean;
  minVoteAverage?: number | null;
  minVoteCount?: number | null;
  releaseDateFrom?: number | null;
  releaseDateTo?: number | null;
}

export const AddonConfigStore = signalStore(
  { providedIn: 'root' },
  withState<AddonConfigState>({ savedId: null, status: 'idle', error: null }),
  withMethods((store) => {
    const addonConfigsService = inject(AddonConfigsService);
    return {
      save: rxMethod<SaveAddonConfigPayload>(
        pipe(
          tap(() => patchState(store, { status: 'saving', error: null })),
          switchMap((payload) =>
            addonConfigsService.create({
              name: payload.name,
              type: payload.type,
              languages: [...payload.languages],
              sort: payload.sort,
              includeAdult: payload.includeAdult,
              minVoteAverage: payload.minVoteAverage,
              minVoteCount: payload.minVoteCount,
              releaseDateFrom: payload.releaseDateFrom,
              releaseDateTo: payload.releaseDateTo,
            }).pipe(
              tap(({ id }) => patchState(store, { savedId: id, status: 'saved' })),
              catchError(() => {
                patchState(store, { status: 'error', error: 'Failed to save config. Are you logged in?' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      resetSaved(): void {
        patchState(store, { savedId: null, status: 'idle', error: null });
      },
    };
  }),
);
