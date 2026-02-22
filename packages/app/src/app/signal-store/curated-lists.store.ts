import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { CuratedListItem, CuratedListsService } from '../core/services/curated-lists.service';

interface CuratedListsState {
  readonly items: readonly CuratedListItem[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
}

export const CuratedListsStore = signalStore(
  { providedIn: 'root' },
  withState<CuratedListsState>({ items: [], status: 'idle' }),
  withComputed(({ status }) => ({
    loading: computed(() => status() === 'loading'),
  })),
  withMethods((store) => {
    const service = inject(CuratedListsService);
    return {
      load: rxMethod<boolean>(
        pipe(
          filter((force) => store.status() !== 'loading' && (force || store.status() !== 'success')),
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            service.list().pipe(
              tap((items) => patchState(store, { items, status: 'success' })),
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
