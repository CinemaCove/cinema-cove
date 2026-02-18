import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { languagesFeature } from './store/languages/languages.reducer';
import { LanguagesEffects } from './store/languages/languages.effects';
import { sortOptionsFeature } from './store/sort-options/sort-options.reducer';
import { SortOptionsEffects } from './store/sort-options/sort-options.effects';
import { addonConfigFeature } from './store/addon-config/addon-config.reducer';
import { AddonConfigEffects } from './store/addon-config/addon-config.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideStore({}, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    provideState(languagesFeature),
    provideState(sortOptionsFeature),
    provideState(addonConfigFeature),
    provideEffects([LanguagesEffects, SortOptionsEffects, AddonConfigEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
