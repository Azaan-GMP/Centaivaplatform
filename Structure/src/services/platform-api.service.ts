import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../environments/environment';
import {
  Organization,
  Tenant,
  TenantMember,
  TenantInvitation,
  PlatformUser,
  UserEffectiveAccess,
  Product,
  Application,
  ApplicationModule,
  ApplicationFeature,
  Role,
  Permission,
  RoleAssignment,
  IntegrationProvider,
  Integration,
  FeatureFlag,
  ServiceAccount,
  AuditEvent,
  WorkWellTenantSelectionResult
} from '../models/platform-api.models';

@Injectable({
  providedIn: 'root'
})
export class PlatformApiService {
  private readonly baseUrl = environment.centaivaApiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // ORGANIZATIONS (PHASE 4)
  // ==========================================
  getOrganizations(includeInactive = false): Observable<Organization[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<Organization[]>(`${this.baseUrl}/api/v1/platform/organizations`, { params });
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/api/v1/platform/organizations/${id}`);
  }

  createOrganization(payload: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(`${this.baseUrl}/api/v1/platform/organizations`, payload);
  }

  updateOrganization(id: string, payload: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.baseUrl}/api/v1/platform/organizations/${id}`, payload);
  }

  deleteOrganization(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/organizations/${id}`).pipe(
      catchError(() => this.http.put(`${this.baseUrl}/api/v1/platform/organizations/${id}`, { status: 'INACTIVE' }).pipe(
        catchError(() => of(null))
      ))
    );
  }

  // ==========================================
  // TENANTS (PHASE 5)
  // ==========================================
  getTenants(includeInactive = false): Observable<Tenant[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<Tenant[]>(`${this.baseUrl}/api/v1/platform/tenants`, { params });
  }

  getTenantById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/api/v1/platform/tenants/${id}`);
  }

  getTenantMembers(id: string): Observable<TenantMember[]> {
    return this.http.get<TenantMember[]>(`${this.baseUrl}/api/v1/platform/tenants/${id}/members`);
  }

  getTenantInvitations(id: string): Observable<TenantInvitation[]> {
    return this.http.get<TenantInvitation[]>(`${this.baseUrl}/api/v1/platform/tenants/${id}/invitations`);
  }

  resolveTenant(identifier: string, includeInactive = false): Observable<Tenant[]> {
    const params = new HttpParams()
      .set('identifier', identifier)
      .set('includeInactive', includeInactive);
    return this.http.get<Tenant[]>(`${this.baseUrl}/api/v1/platform/tenants/resolve`, { params });
  }

  createTenant(payload: Partial<Tenant>): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.baseUrl}/api/v1/platform/tenants`, payload);
  }

  updateTenant(id: string, payload: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.baseUrl}/api/v1/platform/tenants/${id}`, payload);
  }

  deleteTenant(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/tenants/${id}`).pipe(
      catchError((err) => {
        // Backend returns 405 Method Not Allowed (Allow: GET, PUT)
        // Fallback to PUT soft delete / status deactivation
        return this.http.put(`${this.baseUrl}/api/v1/platform/tenants/${id}`, { status: 'INACTIVE', isActive: false }).pipe(
          catchError(() => of(null))
        );
      })
    );
  }

  // ==========================================
  // USERS (PHASE 6)
  // ==========================================
  getUsers(page = 1, pageSize = 25, search = '', status = '', includeDeleted = false): Observable<PlatformUser[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('includeDeleted', includeDeleted);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<PlatformUser[]>(`${this.baseUrl}/api/v1/platform/users`, { params });
  }

  getUserById(id: string): Observable<PlatformUser> {
    return this.http.get<PlatformUser>(`${this.baseUrl}/api/v1/platform/users/${id}`);
  }

  getUserByEmail(email: string): Observable<PlatformUser> {
    const params = new HttpParams().set('email', email);
    return this.http.get<PlatformUser>(`${this.baseUrl}/api/v1/platform/users/by-email`, { params });
  }

  getUserEffectiveAccess(userId: string, applicationKey: string, tenantId?: string): Observable<UserEffectiveAccess> {
    let params = new HttpParams().set('applicationKey', applicationKey);
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<UserEffectiveAccess>(`${this.baseUrl}/api/v1/platform/users/${userId}/access`, { params });
  }

  createUser(payload: Partial<PlatformUser> & { password?: string }): Observable<PlatformUser> {
    return this.http.post<PlatformUser>(`${this.baseUrl}/api/v1/platform/users`, payload);
  }

  updateUser(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser> {
    return this.http.put<PlatformUser>(`${this.baseUrl}/api/v1/platform/users/${id}`, payload);
  }

  updateUserStatus(id: string, status: string): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/api/v1/platform/users/${id}/status`, { status });
  }

  resetPassword(id: string, temporaryPassword?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/api/v1/platform/users/${id}/reset-password`, { temporaryPassword });
  }

  resetMfa(id: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/api/v1/platform/users/${id}/reset-mfa`, {});
  }

  deleteUser(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/users/${id}`).pipe(
      catchError(() => this.http.put(`${this.baseUrl}/api/v1/platform/users/${id}/status`, { status: 'INACTIVE' }).pipe(
        catchError(() => of(null))
      ))
    );
  }

  // ==========================================
  // PRODUCTS & APPLICATIONS (PHASES 7, 8, 9)
  // ==========================================
  getProducts(includeInactive = false): Observable<Product[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<Product[]>(`${this.baseUrl}/api/v1/platform/products`, { params });
  }

  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/api/v1/platform/products`, payload);
  }

  updateProduct(id: string, payload: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/api/v1/platform/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/products/${id}`);
  }

  getApplications(includeInactive = false): Observable<Application[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<Application[]>(`${this.baseUrl}/api/v1/platform/applications`, { params });
  }

  createApplication(payload: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/api/v1/platform/applications`, payload);
  }

  updateApplication(id: string, payload: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/api/v1/platform/applications/${id}`, payload);
  }

  deleteApplication(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/applications/${id}`);
  }

  getApplicationModules(applicationId: string, includeInactive = false): Observable<ApplicationModule[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<ApplicationModule[]>(`${this.baseUrl}/api/v1/platform/applications/${applicationId}/modules`, { params });
  }

  getApplicationFeatures(applicationId: string, includeInactive = false): Observable<ApplicationFeature[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<ApplicationFeature[]>(`${this.baseUrl}/api/v1/platform/applications/${applicationId}/features`, { params });
  }

  // ==========================================
  // ROLES & RBAC (PHASE 10)
  // ==========================================
  getApplicationPermissions(applicationId: string, includeInactive = false): Observable<Permission[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<Permission[]>(`${this.baseUrl}/api/v1/platform/applications/${applicationId}/permissions`, { params });
  }

  getRoles(applicationId?: string, tenantId?: string, includeInactive = false): Observable<Role[]> {
    let params = new HttpParams().set('includeInactive', includeInactive);
    if (applicationId) params = params.set('applicationId', applicationId);
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<Role[]>(`${this.baseUrl}/api/v1/platform/roles`, { params });
  }

  createRole(payload: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/api/v1/platform/roles`, payload);
  }

  updateRole(id: string, payload: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/api/v1/platform/roles/${id}`, payload);
  }

  deleteRole(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/platform/roles/${id}`);
  }

  getRoleAssignments(userId?: string, tenantId?: string): Observable<RoleAssignment[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<RoleAssignment[]>(`${this.baseUrl}/api/v1/role-assignments`, { params });
  }

  createRoleAssignment(payload: Partial<RoleAssignment>): Observable<RoleAssignment> {
    return this.http.post<RoleAssignment>(`${this.baseUrl}/api/v1/role-assignments`, payload);
  }

  deleteRoleAssignment(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/v1/role-assignments/${id}`);
  }

  // ==========================================
  // INTEGRATIONS (PHASE 11)
  // ==========================================
  getIntegrationProviders(includeInactive = false): Observable<IntegrationProvider[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<IntegrationProvider[]>(`${this.baseUrl}/api/v1/platform/integration-providers`, { params });
  }

  getIntegrations(tenantId?: string): Observable<Integration[]> {
    let params = new HttpParams();
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<Integration[]>(`${this.baseUrl}/api/v1/platform/integrations`, { params });
  }

  // ==========================================
  // FEATURE FLAGS & SERVICE ACCOUNTS & AUDIT (PHASES 14, 15, 16)
  // ==========================================
  getFeatureFlags(includeInactive = false): Observable<FeatureFlag[]> {
    const params = new HttpParams().set('includeInactive', includeInactive);
    return this.http.get<FeatureFlag[]>(`${this.baseUrl}/api/v1/platform/feature-flags`, { params });
  }

  getServiceAccounts(): Observable<ServiceAccount[]> {
    return this.http.get<ServiceAccount[]>(`${this.baseUrl}/api/v1/platform/service-accounts`);
  }

  getAuditEvents(page = 1, pageSize = 50): Observable<AuditEvent[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<AuditEvent[]>(`${this.baseUrl}/api/v1/platform/audit-events`, { params });
  }

  // ==========================================
  // WORKWELL TENANT SELECTION / SWITCHING (PHASE 17)
  // ==========================================
  getEligibleTenants(applicationKey = 'WORKWELL_FINANCE'): Observable<Tenant[]> {
    const params = new HttpParams().set('applicationKey', applicationKey);
    return this.http.get<Tenant[]>(`${this.baseUrl}/api/v1/me/tenants`, { params });
  }

  selectTenant(tenantId: string, applicationKey = 'WORKWELL_FINANCE'): Observable<WorkWellTenantSelectionResult> {
    return this.http.post<WorkWellTenantSelectionResult>(`${this.baseUrl}/api/v1/me/select-tenant`, {
      tenantId,
      applicationKey
    });
  }

  switchTenant(tenantId: string, applicationKey = 'WORKWELL_FINANCE'): Observable<WorkWellTenantSelectionResult> {
    return this.http.post<WorkWellTenantSelectionResult>(`${this.baseUrl}/api/v1/me/switch-tenant`, {
      tenantId,
      applicationKey
    });
  }
}
