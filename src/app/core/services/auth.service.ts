import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: environment.oauth.clientId,
      username,
      password,
      scope: environment.oauth.scope,
    });

    return this.http
      .post<TokenResponse>(`${environment.oauth.baseUrl}/connect/token`, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        }),
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => new Error(this.errorMessage(error)))));
  }

  private errorMessage(error: HttpErrorResponse): string {
    const payload = error.error as { error?: string; error_description?: string } | string | null;
    if (payload && typeof payload === 'object') {
      return payload.error_description ?? payload.error ?? 'Sign-in failed. Please check your credentials.';
    }

    return error.status === 0
      ? 'The QA identity service could not be reached. Check the API connection and CORS settings.'
      : 'Sign-in failed. Please check your credentials.';
  }
}
