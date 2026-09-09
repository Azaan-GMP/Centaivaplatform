import { Injectable, computed, signal } from '@angular/core';
import { EnvironmentName } from '../models';
import { CURRENT_USER } from '../mock/data/seed-users';
import { environment as appEnvironment } from '../../../environments/environment';
import { TokenResponse } from './auth.service';

const TOKEN_STORAGE_KEY = 'centaiva.auth.tokens';

/**
 * Holds the signed-in principal and the active environment context.
 * Authentication is mocked in this phase; the shape matches what the
 * Centaiva Identity API will return so only the source changes later.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authenticated = signal(this.hasStoredAccessToken());

  readonly user = signal(CURRENT_USER);
  readonly environment = signal<EnvironmentName>(appEnvironment.name);

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly displayName = computed(() => this.user().displayName);
  readonly roleLabel = computed(() => this.user().primaryRole);
  readonly initials = computed(() => {
    const user = this.user();
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  signIn(tokens: TokenResponse, remember: boolean): void {
    this.clearStoredTokens();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    this.authenticated.set(true);
  }

  signOut(): void {
    this.clearStoredTokens();
    this.authenticated.set(false);
  }

  setEnvironment(environment: EnvironmentName): void {
    this.environment.set(environment);
  }

  accessToken(): string | null {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;

    try {
      return (JSON.parse(raw) as TokenResponse).access_token ?? null;
    } catch {
      this.clearStoredTokens();
      return null;
    }
  }

  private hasStoredAccessToken(): boolean {
    return !!(localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY));
  }

  private clearStoredTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
