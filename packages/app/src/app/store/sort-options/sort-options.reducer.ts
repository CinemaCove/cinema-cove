import { createFeature, createReducer, on } from '@ngrx/store';
import { SortOption } from '../../core/services/sort-options.service';
import { SortOptionsActions } from './sort-options.actions';

interface SortOptionsState {
  readonly items: readonly SortOption[];
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly loaded: boolean;
}

const initialState: SortOptionsState = {
  items: [],
  status: 'idle',
  loaded: false,
};

export const sortOptionsFeature = createFeature({
  name: 'sortOptions',
  reducer: createReducer(
    initialState,
    on(SortOptionsActions.load, (state) => ({ ...state, status: 'loading' as const })),
    on(SortOptionsActions.loadSuccess, (state, { items }) => ({ ...state, items, status: 'success' as const, loaded: true })),
    on(SortOptionsActions.loadFailure, (state) => ({ ...state, status: 'error' as const })),
  ),
});
