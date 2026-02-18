import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { ConfigurationLanguage } from '../../core/services/languages.service';
import { LanguagesActions } from './languages.actions';

interface LanguagesState {
  readonly items: readonly ConfigurationLanguage[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly loaded: boolean;
}

const initialState: LanguagesState = {
  items: [],
  status: 'idle',
  loaded: false,
};

export const languagesFeature = createFeature({
  name: 'languages',
  reducer: createReducer(
    initialState,
    on(LanguagesActions.load, (state) => ({ ...state, status: 'loading' as const })),
    on(LanguagesActions.loadSuccess, (state, { items }) => ({ ...state, items, status: 'success' as const, loaded: true })),
    on(LanguagesActions.loadFailure, (state) => ({ ...state, status: 'error' as const })),
  ),
});

export const selectLanguagesLoading = createSelector(
  languagesFeature.selectStatus,
  (status) => status === 'idle' || status === 'loading',
);
