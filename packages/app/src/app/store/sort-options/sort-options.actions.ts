import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SortOption } from '../../core/services/sort-options.service';

export const SortOptionsActions = createActionGroup({
  source: 'Sort Options',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: readonly SortOption[] }>(),
    'Load Failure': emptyProps(),
  },
});
