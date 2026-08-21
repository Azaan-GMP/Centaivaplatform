import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, Role } from '../models';
import { RolesService } from '../services/data-contracts';
import { ROLES } from './data/seed-access';
import { daysAgo, queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockRolesService extends RolesService {
  private readonly roles: Role[] = [...ROLES];

  list(query?: ListQuery): Observable<PagedResult<Role>> {
    return respond(queryCollection(this.roles, query, ['name', 'key', 'description', 'scope', 'applicationName']));
  }

  all(): Observable<Role[]> {
    return respond([...this.roles]);
  }

  byId(id: string): Observable<Role | undefined> {
    return respond(this.roles.find((role) => role.id === id));
  }

  create(payload: Partial<Role>): Observable<Role> {
    const template = this.roles[this.roles.length - 1]!;
    const name = payload.name ?? 'New Role';

    const role: Role = {
      ...template,
      id: `role-${Date.now().toString(36)}`,
      name,
      key: payload.key ?? name.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
      description: payload.description ?? '',
      scope: payload.scope ?? 'Tenant',
      applicationName: payload.applicationName ?? 'All applications',
      applicationKey: payload.applicationKey ?? null,
      system: false,
      status: 'Draft',
      permissionCount: 0,
      assignmentCount: 0,
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
      permissions: template.permissions.map((grant) => ({ ...grant, granted: false })),
      assignments: [],
    };

    this.roles.push(role);
    return respond(role);
  }

  updatePermissions(id: string, permissionKeys: string[]): Observable<Role | undefined> {
    const role = this.roles.find((candidate) => candidate.id === id);
    if (!role) {
      return respond(undefined);
    }
    const granted = new Set(permissionKeys);
    role.permissions = role.permissions.map((grant) => ({ ...grant, granted: granted.has(grant.permissionKey) }));
    role.permissionCount = permissionKeys.length;
    role.updatedAt = daysAgo(0);
    return respond(role);
  }
}
