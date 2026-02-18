import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ConfigurationLanguage } from '../../core/services/languages.service';

export const LanguagesActions = createActionGroup({
  source: 'Languages',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: readonly ConfigurationLanguage[] }>(),
    'Load Failure': emptyProps(),
  },
});
