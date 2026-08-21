import { Injectable, computed, signal } from '@angular/core';
import { EnvironmentName } from '../models';
import { CURRENT_USER } from '../mock/data/seed-users';

/**
 * Holds the signed-in principal and the active environment context.
 * Authentication is mocked in this phase; the shape matches what the
 * Centaiva Identity API will return so only the source changes later.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authenticated = signal(false);

  readonly user = signal(CURRENT_USER);
  readonly environment = signal<EnvironmentName>('Production');

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly displayName = computed(() => this.user().displayName);
  readonly roleLabel = computed(() => this.user().primaryRole);
  readonly initials = computed(() => {
    const user = this.user();
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  signIn(): void {
    this.authenticated.set(true);
  }

  signOut(): void {
    this.authenticated.set(false);
  }

  setEnvironment(environment: EnvironmentName): void {
    this.environment.set(environment);
  }
}
