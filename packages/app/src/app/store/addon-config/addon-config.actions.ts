import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AddonConfigActions = createActionGroup({
  source: 'Addon Config',
  events: {
    Save: props<{ name: string; contentType: 'movie' | 'tv'; languages: readonly string[]; sort: string }>(),
    'Save Success': props<{ id: string }>(),
    'Save Failure': props<{ error: string }>(),
    'Reset Saved': emptyProps(),
  },
});
