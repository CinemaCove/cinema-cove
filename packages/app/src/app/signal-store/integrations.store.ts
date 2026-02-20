import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IntegrationsService, TmdbStatus } from '../core/services/integrations.service';

interface IntegrationsState {
  readonly tmdb: TmdbStatus | null;
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly connecting: boolean;
  readonly disconnecting: boolean;
}

export const IntegrationsStore = signalStore(
  { providedIn: 'root' },
  withState<IntegrationsState>({
    tmdb: null,
    status: 'idle',
    connecting: false,
    disconnecting: false,
  }),
  withComputed(({ tmdb, status }) => ({
    loading: computed(() => status() === 'loading'),
    tmdbConnected: computed(() => tmdb()?.connected ?? false),
    tmdbUsername: computed(() => tmdb()?.username ?? null),
  })),
  withMethods((store) => {
    const service = inject(IntegrationsService);
    return {
      load: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            service.getTmdbStatus().pipe(
              tap((tmdb) => patchState(store, { tmdb, status: 'success' })),
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      connectTmdb: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { connecting: true })),
          switchMap(() =>
            service.connectTmdb().pipe(
              tap(({ authUrl }) => {
                patchState(store, { connecting: false });
                window.location.href = authUrl;
              }),
              catchError(() => {
                patchState(store, { connecting: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      disconnectTmdb: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { disconnecting: true })),
          switchMap(() =>
            service.disconnectTmdb().pipe(
              tap(() =>
                patchState(store, {
                  disconnecting: false,
                  tmdb: { connected: false, accountId: null, username: null },
                }),
              ),
              catchError(() => {
                patchState(store, { disconnecting: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      markConnected(username: string, accountId: number): void {
        patchState(store, {
          tmdb: { connected: true, accountId, username },
          status: 'success',
        });
      },
    };
  }),
);
