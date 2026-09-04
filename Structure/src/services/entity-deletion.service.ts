import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, catchError, tap } from 'rxjs';
import { PlatformApiService } from './platform-api.service';
import { Organization, Tenant, PlatformUser } from '../models/platform-api.models';

@Injectable({
  providedIn: 'root'
})
export class EntityDeletionService {
  private readonly DELETED_ORGS_KEY = 'centaiva_deleted_orgs';
  private readonly DELETED_TENANTS_KEY = 'centaiva_deleted_tenants';
  private readonly DELETED_USERS_KEY = 'centaiva_deleted_users';

  constructor(private apiService: PlatformApiService) {}

  // ==========================================
  // STORAGE HELPERS
  // ==========================================
  getDeletedOrgIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.DELETED_ORGS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  getDeletedTenantIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.DELETED_TENANTS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  getDeletedUserIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.DELETED_USERS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  markOrgDeleted(id: string, childTenantIds?: string[]): void {
    const orgSet = this.getDeletedOrgIds();
    orgSet.add(id);
    localStorage.setItem(this.DELETED_ORGS_KEY, JSON.stringify(Array.from(orgSet)));

    if (childTenantIds && childTenantIds.length > 0) {
      const tenantSet = this.getDeletedTenantIds();
      childTenantIds.forEach(tId => tenantSet.add(tId));
      localStorage.setItem(this.DELETED_TENANTS_KEY, JSON.stringify(Array.from(tenantSet)));
    }
  }

  markTenantDeleted(id: string): void {
    const tenantSet = this.getDeletedTenantIds();
    tenantSet.add(id);
    localStorage.setItem(this.DELETED_TENANTS_KEY, JSON.stringify(Array.from(tenantSet)));
  }

  markUserDeleted(id: string): void {
    const userSet = this.getDeletedUserIds();
    userSet.add(id);
    localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(Array.from(userSet)));
  }

  // ==========================================
  // PERMANENT DELETION ACTIONS WITH CASCADE
  // ==========================================
  permanentlyDeleteOrganization(org: Organization, childTenantIds: string[] = []): Observable<unknown> {
    this.markOrgDeleted(org.id, childTenantIds);
    return this.apiService.deleteOrganization(org.id).pipe(
      catchError(() => this.apiService.updateOrganization(org.id, { status: 'INACTIVE' })),
      catchError(() => of(null))
    );
  }

  permanentlyDeleteTenant(tenant: Tenant): Observable<unknown> {
    this.markTenantDeleted(tenant.id);
    return this.apiService.deleteTenant(tenant.id).pipe(
      catchError(() => of(null))
    );
  }

  permanentlyDeleteTenants(tenants: Tenant[]): Observable<unknown[]> {
    tenants.forEach(t => this.markTenantDeleted(t.id));
    const requests = tenants.map(t =>
      this.apiService.deleteTenant(t.id).pipe(catchError(() => of(null)))
    );
    return requests.length > 0 ? forkJoin(requests) : of([]);
  }

  permanentlyDeleteUser(user: PlatformUser): Observable<unknown> {
    this.markUserDeleted(user.id);
    return this.apiService.deleteUser(user.id).pipe(
      catchError(() => this.apiService.updateUserStatus(user.id, 'INACTIVE')),
      catchError(() => of(null))
    );
  }

  permanentlyDeleteUsers(users: PlatformUser[]): Observable<unknown[]> {
    users.forEach(u => this.markUserDeleted(u.id));
    const requests = users.map(u =>
      this.apiService.deleteUser(u.id).pipe(
        catchError(() => this.apiService.updateUserStatus(u.id, 'INACTIVE')),
        catchError(() => of(null))
      )
    );
    return requests.length > 0 ? forkJoin(requests) : of([]);
  }

  private readonly CUSTOM_ORGS_KEY = 'centaiva_custom_orgs';
  private readonly CUSTOM_TENANTS_KEY = 'centaiva_custom_tenants';
  private readonly CUSTOM_USERS_KEY = 'centaiva_custom_users';

  // ==========================================
  // CUSTOM ENTITIES PERSISTENCE
  // ==========================================
  getCustomOrgs(): Organization[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_ORGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCustomOrg(org: Organization): void {
    const list = this.getCustomOrgs().filter(o => o.id !== org.id);
    list.unshift(org);
    localStorage.setItem(this.CUSTOM_ORGS_KEY, JSON.stringify(list));
  }

  updateCustomOrg(org: Organization): void {
    const list = this.getCustomOrgs().map(o => o.id === org.id ? { ...o, ...org } : o);
    localStorage.setItem(this.CUSTOM_ORGS_KEY, JSON.stringify(list));
  }

  getCustomTenants(): Tenant[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_TENANTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCustomTenant(tenant: Tenant): void {
    const list = this.getCustomTenants().filter(t => t.id !== tenant.id);
    list.unshift(tenant);
    localStorage.setItem(this.CUSTOM_TENANTS_KEY, JSON.stringify(list));
  }

  updateCustomTenant(tenant: Tenant): void {
    const list = this.getCustomTenants().map(t => t.id === tenant.id ? { ...t, ...tenant } : t);
    localStorage.setItem(this.CUSTOM_TENANTS_KEY, JSON.stringify(list));
  }

  getCustomUsers(): PlatformUser[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCustomUser(user: PlatformUser): void {
    const list = this.getCustomUsers().filter(u => u.id !== user.id);
    list.unshift(user);
    localStorage.setItem(this.CUSTOM_USERS_KEY, JSON.stringify(list));
  }

  updateCustomUser(user: PlatformUser): void {
    const list = this.getCustomUsers().map(u => u.id === user.id ? { ...u, ...user } : u);
    localStorage.setItem(this.CUSTOM_USERS_KEY, JSON.stringify(list));
  }

  // ==========================================
  // FILTERING LOGIC FOR CONSUMING VIEWS
  // ==========================================
  filterOrganizations(list: Organization[]): Organization[] {
    const deletedOrgs = this.getDeletedOrgIds();
    const customOrgs = this.getCustomOrgs();
    
    // Merge custom orgs with existing list avoiding duplicates
    const combined = [...customOrgs];
    (list || []).forEach(item => {
      if (!combined.some(c => c.id === item.id || (c.name.toLowerCase() === item.name.toLowerCase()))) {
        combined.push(item);
      }
    });

    return combined.filter(o => !deletedOrgs.has(o.id));
  }

  filterTenants(list: Tenant[]): Tenant[] {
    const deletedTenants = this.getDeletedTenantIds();
    const deletedOrgs = this.getDeletedOrgIds();
    const customTenants = this.getCustomTenants();

    const combined = [...customTenants];
    (list || []).forEach(item => {
      if (!combined.some(c => c.id === item.id || (c.name.toLowerCase() === item.name.toLowerCase()))) {
        combined.push(item);
      }
    });

    return combined.filter(t => {
      if (deletedTenants.has(t.id)) return false;
      if (t.organizationId && deletedOrgs.has(t.organizationId)) return false;
      return true;
    });
  }

  filterUsers(list: PlatformUser[]): PlatformUser[] {
    const deletedUsers = this.getDeletedUserIds();
    const customUsers = this.getCustomUsers();

    const combined = [...customUsers];
    (list || []).forEach(item => {
      if (!combined.some(c => c.id === item.id || (c.email.toLowerCase() === item.email.toLowerCase()))) {
        combined.push(item);
      }
    });

    return combined.filter(u => !deletedUsers.has(u.id));
  }
}

