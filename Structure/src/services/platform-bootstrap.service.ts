import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, tap, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { PlatformBootstrap, AdminScope, PlatformContextMe } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class PlatformBootstrapService {
  readonly bootstrapData = signal<PlatformBootstrap | null>(null);
  readonly adminScope = signal<AdminScope | null>(null);
  readonly contextMe = signal<PlatformContextMe | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isInitialized = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Loads tenantless platform control context and bootstrap metadata.
   * NOTE: Does NOT call /api/v1/me/session-policy with platformControlToken.
   */
  loadPlatformBootstrap(): Observable<{
    bootstrap: PlatformBootstrap | null;
    adminScope: AdminScope | null;
    context: PlatformContextMe | null;
  }> {
    this.isLoading.set(true);

    const bootstrap$ = this.http.get<PlatformBootstrap>(`${environment.centaivaApiUrl}/api/v1/platform/bootstrap`).pipe(
      catchError(err => {
        console.warn('[PlatformBootstrapService] /api/v1/platform/bootstrap fallback:', err);
        return of(null);
      })
    );

    const adminScope$ = this.http.get<AdminScope>(`${environment.centaivaApiUrl}/api/v1/platform/me/admin-scope`).pipe(
      catchError(err => {
        console.warn('[PlatformBootstrapService] /api/v1/platform/me/admin-scope fallback:', err);
        return of(null);
      })
    );

    const contextMe$ = this.http.get<PlatformContextMe>(`${environment.centaivaApiUrl}/api/v1/context/me`).pipe(
      catchError(err => {
        console.warn('[PlatformBootstrapService] /api/v1/context/me fallback:', err);
        return of(null);
      })
    );

    return forkJoin({
      bootstrap: bootstrap$,
      adminScope: adminScope$,
      context: contextMe$
    }).pipe(
      tap(({ bootstrap, adminScope, context }) => {
        if (bootstrap) this.bootstrapData.set(bootstrap);
        if (adminScope) this.adminScope.set(adminScope);
        if (context) this.contextMe.set(context);

        this.isInitialized.set(true);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.isLoading.set(false);
        return of({
          bootstrap: null,
          adminScope: null,
          context: null
        });
      })
    );
  }

  clear(): void {
    this.bootstrapData.set(null);
    this.adminScope.set(null);
    this.contextMe.set(null);
    this.isInitialized.set(false);
    this.isLoading.set(false);
  }
}
