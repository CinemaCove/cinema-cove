import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  IntegrationsService,
  TmdbListInfo,
  TmdbStatus,
  InstallTmdbListRequest,
} from '../core/services/integrations.service';

interface InstallingList {
  listType: string;
  type: string;
}

interface IntegrationsState {
  readonly tmdb: TmdbStatus | null;
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly connecting: boolean;
  readonly disconnecting: boolean;
  readonly tmdbLists: readonly TmdbListInfo[];
  readonly listsStatus: 'idle' | 'loading' | 'success' | 'error';
  readonly installing: InstallingList | null;
}

export const IntegrationsStore = signalStore(
  { providedIn: 'root' },
  withState<IntegrationsState>({
    tmdb: null,
    status: 'idle',
    connecting: false,
    disconnecting: false,
    tmdbLists: [],
    listsStatus: 'idle',
    installing: null,
  }),
  withComputed(({ tmdb, status, listsStatus, installing }) => ({
    loading: computed(() => status() === 'loading'),
    tmdbConnected: computed(() => tmdb()?.connected ?? false),
    tmdbUsername: computed(() => tmdb()?.username ?? null),
    listsLoading: computed(() => listsStatus() === 'loading'),
    isInstalling: computed(() => installing() !== null),
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
                  tmdbLists: [],
                  listsStatus: 'idle',
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

      loadTmdbLists: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { listsStatus: 'loading' })),
          switchMap(() =>
            service.getTmdbLists().pipe(
              tap(({ lists }) => patchState(store, { tmdbLists: lists, listsStatus: 'success' })),
              catchError(() => {
                patchState(store, { listsStatus: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      installTmdbList: rxMethod<InstallTmdbListRequest>(
        pipe(
          tap((req) => patchState(store, { installing: { listType: req.listType, type: req.type } })),
          switchMap((req) =>
            service.installTmdbList(req).pipe(
              tap(({ installUrl }) => {
                patchState(store, { installing: null });
                window.location.href = installUrl;
              }),
              catchError(() => {
                patchState(store, { installing: null });
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
