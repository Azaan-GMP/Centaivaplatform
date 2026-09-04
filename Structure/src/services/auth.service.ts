import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { OAuthTokenResponse, UserProfile } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<UserProfile | null>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    this.restoreUserFromToken();
  }

  loginPlatformOwner(username: string, password: string): Observable<OAuthTokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', environment.platformClientId)
      .set('username', username)
      .set('password', password)
      .set('scope', environment.platformScope);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post<OAuthTokenResponse>(
      `${environment.centaivaApiUrl}/connect/token`,
      body.toString(),
      { headers }
    ).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.tokenStorage.setPlatformControlToken(response.access_token, response.refresh_token);
          this.restoreUserFromToken();
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.tokenStorage.clearAll();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.hasPlatformSession();
  }

  private restoreUserFromToken(): void {
    const token = this.tokenStorage.getPlatformControlToken();
    if (!token) {
      this.currentUserSignal.set(null);
      return;
    }

    const payload = this.tokenStorage.decodeToken(token);
    if (!payload) {
      this.currentUserSignal.set(null);
      return;
    }

    const roles = Array.isArray(payload['role'])
      ? (payload['role'] as string[])
      : payload['role']
        ? [(payload['role'] as string)]
        : [];

    const isPlatformOwner = roles.some(r => r.toUpperCase() === 'PLATFORM_OWNER' || r.toUpperCase() === 'PLATFORMOWNER');

    const profile: UserProfile = {
      id: (payload.sub as string) || '',
      email: (payload.email as string) || (payload['preferred_username'] as string) || '',
      fullName: (payload.name as string) || (payload.email as string) || 'Platform User',
      roles,
      isPlatformOwner,
      tenantId: (payload.tenant_id as string) || null
    };

    this.currentUserSignal.set(profile);
  }
}
