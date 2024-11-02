import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { httpCoreInterceptorInterceptor } from './httpcoreinterceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     
    provideAnimationsAsync(),
    provideRouter(routes,withPreloading(PreloadAllModules)),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch(),
      withInterceptors([httpCoreInterceptorInterceptor]) //colocar un interceptor
      
    ),
  ]
};
