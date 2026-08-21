import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, PlatformUser } from '../models';
import { UsersService } from '../services/data-contracts';
import { USERS } from './data/seed-users';
import { daysAgo, queryCollection, respond } from './mock-utils';

const SEARCH_FIELDS = ['displayName', 'email', 'jobTitle', 'primaryRole', 'id'];

@Injectable({ providedIn: 'root' })
export class MockUsersService extends UsersService {
  private readonly users: PlatformUser[] = [...USERS];

  list(query?: ListQuery): Observable<PagedResult<PlatformUser>> {
    return respond(queryCollection(this.users, query, SEARCH_FIELDS));
  }

  all(): Observable<PlatformUser[]> {
    return respond([...this.users]);
  }

  byId(id: string): Observable<PlatformUser | undefined> {
    return respond(this.users.find((user) => user.id === id));
  }

  create(payload: Partial<PlatformUser>): Observable<PlatformUser> {
    const template = this.users[0]!;
    const first = payload.firstName ?? 'New';
    const last = payload.lastName ?? 'User';

    const user: PlatformUser = {
      ...template,
      id: `usr-${Date.now().toString(36)}`,
      displayName: payload.displayName ?? `${first} ${last}`,
      firstName: first,
      lastName: last,
      email: payload.email ?? `${first}.${last}@centaiva.com`.toLowerCase(),
      jobTitle: payload.jobTitle ?? 'Platform User',
      status: payload.status ?? 'Invited',
      mfa: 'Pending',
      emailVerified: false,
      organizationIds: payload.organizationIds ?? [],
      tenantIds: payload.tenantIds ?? [],
      productKeys: payload.productKeys ?? [],
      primaryRole: payload.primaryRole ?? 'Read Only',
      createdAt: daysAgo(0),
      lastSignInAt: null,
      organizations: [],
      tenants: [],
      sessions: [],
      securityEvents: [],
      avatarColor: '#1a73e8',
    };

    this.users.unshift(user);
    return respond(user);
  }

  update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser | undefined> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      return respond(undefined);
    }
    const updated = { ...this.users[index]!, ...payload };
    this.users[index] = updated;
    return respond(updated);
  }

  setStatus(id: string, status: PlatformUser['status']): Observable<PlatformUser | undefined> {
    return this.update(id, { status });
  }
}
