import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(SessionService).accessToken();
  const isApiRequest = !!environment.apiBaseUrl && request.url.startsWith(environment.apiBaseUrl);
  const isTokenRequest = request.url.endsWith('/connect/token');

  if (!token || !isApiRequest || isTokenRequest) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
