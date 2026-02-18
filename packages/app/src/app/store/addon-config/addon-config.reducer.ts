import { createFeature, createReducer, on } from '@ngrx/store';
import { AddonConfigActions } from './addon-config.actions';

interface AddonConfigState {
  readonly savedId: string | null;
  readonly status: 'idle' | 'saving' | 'saved' | 'error';
  readonly error: string | null;
}

const initialState: AddonConfigState = {
  savedId: null,
  status: 'idle',
  error: null,
};

export const addonConfigFeature = createFeature({
  name: 'addonConfig',
  reducer: createReducer(
    initialState,
    on(AddonConfigActions.save, (state) => ({ ...state, status: 'saving' as const, error: null })),
    on(AddonConfigActions.saveSuccess, (state, { id }) => ({ ...state, savedId: id, status: 'saved' as const })),
    on(AddonConfigActions.saveFailure, (state, { error }) => ({ ...state, status: 'error' as const, error })),
    on(AddonConfigActions.resetSaved, (state) => ({ ...state, savedId: null, status: 'idle' as const, error: null })),
  ),
});
