import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { ConfigurationLanguage, LanguagesService } from '../core/services/languages.service';

interface LanguagesState {
  readonly items: readonly ConfigurationLanguage[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly loaded: boolean;
}

export const LanguagesStore = signalStore(
  { providedIn: 'root' },
  withState<LanguagesState>({ items: [], status: 'idle', loaded: false }),
  withComputed(({ status }) => ({
    loading: computed(() => status() === 'idle' || status() === 'loading'),
  })),
  withMethods((store) => {
    const languagesService = inject(LanguagesService);
    return {
      load: rxMethod<void>(
        pipe(
          filter(() => !store.loaded()),
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            languagesService.getLanguages().pipe(
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
