import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { AddonConfigItem, AddonConfigsService } from '../core/services/addon-configs.service';

interface CatalogsState {
  readonly items: readonly AddonConfigItem[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly deletingId: string | null;
}

export const CatalogsStore = signalStore(
  { providedIn: 'root' },
  withState<CatalogsState>({ items: [], status: 'idle', deletingId: null }),
  withComputed(({ status, items }) => ({
    loading: computed(() => status() === 'loading'),
    atLimit: computed(() => items().length >= 20),
  })),
  withMethods((store) => {
    const service = inject(AddonConfigsService);
    return {
      load: rxMethod<void>(
        pipe(
          filter(() => store.status() !== 'loading'),
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
      deleteItem: rxMethod<string>(
        pipe(
          tap((id) => patchState(store, { deletingId: id })),
          switchMap((id) =>
            service.delete(id).pipe(
              tap(() =>
                patchState(store, {
                  items: store.items().filter((i) => i.id !== id),
                  deletingId: null,
                }),
              ),
              catchError(() => {
                patchState(store, { deletingId: null });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
