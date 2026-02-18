import { createSelector } from '@ngrx/store';
import { languagesFeature } from './languages/languages.reducer';
import { sortOptionsFeature } from './sort-options/sort-options.reducer';
import { addonConfigFeature } from './addon-config/addon-config.reducer';

export const selectIsAnyLoading = createSelector(
  languagesFeature.selectStatus,
  sortOptionsFeature.selectStatus,
  addonConfigFeature.selectStatus,
  (l, s, a) => l === 'loading' || s === 'loading' || a === 'saving',
);
