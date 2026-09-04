import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  // Skip OAuth connect token endpoints
  if (req.url.includes('/connect/token')) {
    return next(req);
  }

  // Determine token context
  let token: string | null = null;
  const isWorkwellReq = req.url.includes(environment.workwellApiUrl) || req.url.includes('/api/v1/me/session-policy');

  if (isWorkwellReq) {
    token = tokenStorage.getWorkwellFinanceToken();
  } else {
    token = tokenStorage.getPlatformControlToken();
  }

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isWorkwellReq) {
          console.warn('[AuthInterceptor] 401 Unauthorized for Platform Control Token. Redirecting to login.');
          tokenStorage.clearPlatformToken();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
