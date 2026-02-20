import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { SortOption, SortOptionsService } from '../core/services/sort-options.service';

interface SortOptionsState {
  readonly items: readonly SortOption[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly loaded: boolean;
}

export const SortOptionsStore = signalStore(
  { providedIn: 'root' },
  withState<SortOptionsState>({ items: [], status: 'idle', loaded: false }),
  withMethods((store) => {
    const sortOptionsService = inject(SortOptionsService);
    return {
      load: rxMethod<void>(
        pipe(
          filter(() => !store.loaded()),
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            sortOptionsService.getSortOptions().pipe(
              tap((items) => patchState(store, { items, status: 'success', loaded: true })),
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
