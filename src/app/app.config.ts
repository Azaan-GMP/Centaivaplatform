import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { MOCK_DATA_PROVIDERS } from './core/mock/mock-providers';
import { CentaivaPreset } from './core/theme/centaiva-preset';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    providePrimeNG({
      theme: {
        preset: CentaivaPreset,
        options: {
          darkModeSelector: '.ctv-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
      ripple: false,
    }),
    MessageService,
    ConfirmationService,

    // Data layer — swap these for HTTP-backed services during API integration.
    ...MOCK_DATA_PROVIDERS,
  ],
};
