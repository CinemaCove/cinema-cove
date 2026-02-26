import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { CuratedGroupItem, CuratedGroupsService } from '../core/services/curated-groups.service';

interface CuratedGroupsState {
  readonly items: readonly CuratedGroupItem[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
}

export const CuratedGroupsStore = signalStore(
  { providedIn: 'root' },
  withState<CuratedGroupsState>({ items: [], status: 'idle' }),
  withComputed(({ status }) => ({
    loading: computed(() => status() === 'loading'),
  })),
  withMethods((store) => {
    const service = inject(CuratedGroupsService);
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
