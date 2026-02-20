import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  IntegrationsService,
  TmdbBuiltinList,
  TmdbCustomList,
  TmdbStatus,
  TraktBuiltinList,
  TraktCustomList,
  TraktStatus,
} from '../core/services/integrations.service';

/** A unique key for tracking which install button is spinning. */
export type InstallKey = string;

interface IntegrationsState {
  readonly tmdb: TmdbStatus | null;
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly connecting: boolean;
  readonly disconnecting: boolean;
  readonly builtinLists: readonly TmdbBuiltinList[];
  readonly customLists: readonly TmdbCustomList[];
  readonly listsPage: number;
  readonly listsTotalPages: number;
  readonly listsStatus: 'idle' | 'loading' | 'success' | 'error';
  readonly installingKey: InstallKey | null;
  // Trakt
  readonly trakt: TraktStatus | null;
  readonly traktStatus: 'idle' | 'loading' | 'success' | 'error';
  readonly traktConnecting: boolean;
  readonly traktDisconnecting: boolean;
  readonly traktBuiltinLists: readonly TraktBuiltinList[];
  readonly traktCustomLists: readonly TraktCustomList[];
  readonly traktListsStatus: 'idle' | 'loading' | 'success' | 'error';
  readonly traktInstallingKey: InstallKey | null;
}

export const IntegrationsStore = signalStore(
  { providedIn: 'root' },
  withState<IntegrationsState>({
    tmdb: null,
    status: 'idle',
    connecting: false,
    disconnecting: false,
    builtinLists: [],
    customLists: [],
    listsPage: 1,
    listsTotalPages: 1,
    listsStatus: 'idle',
    installingKey: null,
    trakt: null,
    traktStatus: 'idle',
    traktConnecting: false,
    traktDisconnecting: false,
    traktBuiltinLists: [],
    traktCustomLists: [],
    traktListsStatus: 'idle',
    traktInstallingKey: null,
  }),
  withComputed(({
    tmdb, status, listsStatus, installingKey, listsPage, listsTotalPages,
    trakt, traktStatus, traktListsStatus, traktInstallingKey,
  }) => ({
    loading: computed(() => status() === 'loading'),
    tmdbConnected: computed(() => tmdb()?.connected ?? false),
    tmdbUsername: computed(() => tmdb()?.username ?? null),
    listsLoading: computed(() => listsStatus() === 'loading'),
    hasPrevPage: computed(() => listsPage() > 1),
    hasNextPage: computed(() => listsPage() < listsTotalPages()),
    isInstalling: computed(() => installingKey() !== null),
    traktLoading: computed(() => traktStatus() === 'loading'),
    traktConnected: computed(() => trakt()?.connected ?? false),
    traktUsername: computed(() => trakt()?.username ?? null),
    traktListsLoading: computed(() => traktListsStatus() === 'loading'),
    isTraktInstalling: computed(() => traktInstallingKey() !== null),
  })),
  withMethods((store) => {
    const service = inject(IntegrationsService);

    function fetchLists(page: number) {
      patchState(store, { listsStatus: 'loading', listsPage: page });
      return service.getTmdbLists(page).pipe(
        tap(({ builtinLists, customLists, totalPages }) =>
          patchState(store, {
            builtinLists,
            customLists,
            listsTotalPages: totalPages || 1,
            listsStatus: 'success',
          }),
        ),
        catchError(() => {
          patchState(store, { listsStatus: 'error' });
          return EMPTY;
        }),
      );
    }

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
                  builtinLists: [],
                  customLists: [],
                  listsPage: 1,
                  listsTotalPages: 1,
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
        pipe(switchMap(() => fetchLists(1))),
      ),

      prevPage: rxMethod<void>(
        pipe(switchMap(() => fetchLists(store.listsPage() - 1))),
      ),

      nextPage: rxMethod<void>(
        pipe(switchMap(() => fetchLists(store.listsPage() + 1))),
      ),

      installBuiltinList: rxMethod<TmdbBuiltinList>(
        pipe(
          tap((list) => patchState(store, { installingKey: `${list.listType}-${list.type}` })),
          switchMap((list) =>
            service.installBuiltinList(list.listType, list.type, list.label).pipe(
              tap(({ installUrl }) => {
                patchState(store, { installingKey: null });
                window.location.href = installUrl;
              }),
              catchError(() => {
                patchState(store, { installingKey: null });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      installCustomList: rxMethod<TmdbCustomList>(
        pipe(
          tap((list) => patchState(store, { installingKey: list.id })),
          switchMap((list) =>
            service.installCustomList(list.id, list.name).pipe(
              tap(({ installUrl }) => {
                patchState(store, { installingKey: null });
                window.location.href = installUrl;
              }),
              catchError(() => {
                patchState(store, { installingKey: null });
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

      // ── Trakt ──────────────────────────────────────────────────────────────

      loadTrakt: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { traktStatus: 'loading' })),
          switchMap(() =>
            service.getTraktStatus().pipe(
              tap((trakt) => patchState(store, { trakt, traktStatus: 'success' })),
              catchError(() => {
                patchState(store, { traktStatus: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      connectTrakt: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { traktConnecting: true })),
          switchMap(() =>
            service.connectTrakt().pipe(
              tap(({ authUrl }) => {
                patchState(store, { traktConnecting: false });
                window.location.href = authUrl;
              }),
              catchError(() => {
                patchState(store, { traktConnecting: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      disconnectTrakt: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { traktDisconnecting: true })),
          switchMap(() =>
            service.disconnectTrakt().pipe(
              tap(() =>
                patchState(store, {
                  traktDisconnecting: false,
                  trakt: { connected: false, username: null },
                  traktBuiltinLists: [],
                  traktCustomLists: [],
                  traktListsStatus: 'idle',
                }),
              ),
              catchError(() => {
                patchState(store, { traktDisconnecting: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadTraktLists: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { traktListsStatus: 'loading' })),
          switchMap(() =>
            service.getTraktLists().pipe(
              tap(({ builtinLists, customLists }) =>
                patchState(store, {
                  traktBuiltinLists: builtinLists,
                  traktCustomLists: customLists,
                  traktListsStatus: 'success',
                }),
              ),
              catchError(() => {
                patchState(store, { traktListsStatus: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      installTraktBuiltinList: rxMethod<TraktBuiltinList>(
        pipe(
          tap((list) => patchState(store, { traktInstallingKey: `${list.listType}-${list.type}` })),
          switchMap((list) =>
            service.installTraktBuiltinList(list.listType, list.type, list.label).pipe(
              tap(({ installUrl }) => {
                patchState(store, { traktInstallingKey: null });
                window.location.href = installUrl;
              }),
              catchError(() => {
                patchState(store, { traktInstallingKey: null });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      installTraktCustomList: rxMethod<TraktCustomList>(
        pipe(
          tap((list) => patchState(store, { traktInstallingKey: list.id })),
          switchMap((list) =>
            service.installTraktCustomList(list.id, list.slug, list.name).pipe(
              tap(({ installUrl }) => {
                patchState(store, { traktInstallingKey: null });
                window.location.href = installUrl;
              }),
              catchError(() => {
                patchState(store, { traktInstallingKey: null });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      markTraktConnected(username: string): void {
        patchState(store, {
          trakt: { connected: true, username },
          traktStatus: 'success',
        });
      },
    };
  }),
);
