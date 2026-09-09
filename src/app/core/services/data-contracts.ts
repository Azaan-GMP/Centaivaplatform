import { Observable } from 'rxjs';
import {
  ActiveSession,
  Application,
  AuditEvent,
  AuthenticationPolicy,
  DataStore,
  Deployment,
  Entitlement,
  FeatureFlag,
  HealthSignal,
  IdentityProvider,
  IntegrationProvider,
  Invitation,
  KpiMetric,
  License,
  LicensePool,
  ListQuery,
  Organization,
  OrganizationNode,
  PagedResult,
  Permission,
  Plan,
  PlatformEnvironment,
  PlatformRegion,
  PlatformUser,
  UserEffectiveAccess,
  Product,
  ProvisioningRun,
  ProvisioningTemplate,
  QuotaRecord,
  Role,
  SecurityAlert,
  ServiceAccount,
  Subscription,
  Tenant,
  TenantIntegration,
  TrendPoint,
  UsageSummary,
  VerifiedDomain,
} from '../models';

/**
 * Abstract data-access contracts.
 *
 * Every page depends on these abstractions rather than on the mock
 * implementations. When the Centaiva backend is wired up, each mock class is
 * swapped for an HTTP-backed class in `mock-providers.ts` and no page changes.
 */

export abstract class UsersService {
  abstract list(query?: ListQuery): Observable<PagedResult<PlatformUser>>;
  abstract all(): Observable<PlatformUser[]>;
  abstract byId(id: string): Observable<PlatformUser | undefined>;
  abstract create(payload: Partial<PlatformUser>): Observable<PlatformUser>;
  abstract createTenantUser(
    tenantId: string,
    payload: { email: string; displayName: string; temporaryPassword?: string; applicationKey: string; roleKey: string },
  ): Observable<PlatformUser>;
  abstract update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser | undefined>;
  abstract setStatus(id: string, status: PlatformUser['status']): Observable<PlatformUser | undefined>;
  abstract resetPassword(id: string, newPassword: string): Observable<void>;
  abstract resetMfa(id: string): Observable<void>;
  abstract effectiveAccess(id: string, applicationKey?: string, tenantId?: string): Observable<UserEffectiveAccess>;
}

export abstract class OrganizationsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Organization>>;
  abstract all(): Observable<Organization[]>;
  abstract tree(): Observable<OrganizationNode[]>;
  abstract byId(id: string): Observable<Organization | undefined>;
  abstract childrenOf(id: string): Observable<Organization[]>;
  abstract create(payload: Partial<Organization>): Observable<Organization>;
  abstract move(id: string, newParentId: string): Observable<Organization | undefined>;
  abstract update(id: string, payload: Partial<Organization>): Observable<Organization | undefined>;
}

export abstract class TenantsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Tenant>>;
  abstract all(): Observable<Tenant[]>;
  abstract byId(id: string): Observable<Tenant | undefined>;
  abstract byOrganization(organizationId: string): Observable<Tenant[]>;
  abstract create(payload: Partial<Tenant>): Observable<Tenant>;
  abstract update(id: string, payload: Partial<Tenant>): Observable<Tenant | undefined>;
}

export abstract class ProductsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Product>>;
  abstract all(): Observable<Product[]>;
  abstract byId(id: string): Observable<Product | undefined>;
}

export abstract class ApplicationsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Application>>;
  abstract all(): Observable<Application[]>;
  abstract byId(id: string): Observable<Application | undefined>;
  abstract byProduct(productKey: string): Observable<Application[]>;
  abstract permissions(): Observable<Permission[]>;
}

export abstract class RolesService {
  abstract list(query?: ListQuery): Observable<PagedResult<Role>>;
  abstract all(): Observable<Role[]>;
  abstract byId(id: string): Observable<Role | undefined>;
  abstract create(payload: Partial<Role>): Observable<Role>;
  abstract updatePermissions(id: string, permissionKeys: string[]): Observable<Role | undefined>;
}

export abstract class PlansService {
  abstract list(query?: ListQuery): Observable<PagedResult<Plan>>;
  abstract all(): Observable<Plan[]>;
  abstract byId(id: string): Observable<Plan | undefined>;
  abstract entitlements(): Observable<Entitlement[]>;
}

export abstract class SubscriptionsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Subscription>>;
  abstract all(): Observable<Subscription[]>;
  abstract byId(id: string): Observable<Subscription | undefined>;
  abstract create(payload: Partial<Subscription>): Observable<Subscription>;
}

export abstract class LicensesService {
  abstract list(query?: ListQuery): Observable<PagedResult<License>>;
  abstract all(): Observable<License[]>;
  abstract byId(id: string): Observable<License | undefined>;
  abstract pools(): Observable<LicensePool[]>;
  abstract issue(payload: Partial<License>): Observable<License>;
  abstract setStatus(id: string, status: License['status']): Observable<License | undefined>;
  abstract rotateKey(id: string): Observable<License | undefined>;
  abstract createPool(payload: Partial<LicensePool>): Observable<LicensePool>;
  abstract allocateSeats(poolId: string, seats: number): Observable<LicensePool | undefined>;
}

export abstract class UsageService {
  abstract summary(tenantId?: string, productKey?: string): Observable<UsageSummary>;
  abstract quotas(query?: ListQuery): Observable<PagedResult<QuotaRecord>>;
}

export abstract class ProvisioningService {
  abstract runs(query?: ListQuery): Observable<PagedResult<ProvisioningRun>>;
  abstract runById(id: string): Observable<ProvisioningRun | undefined>;
  abstract templates(): Observable<ProvisioningTemplate[]>;
}

export abstract class DeploymentsService {
  abstract list(query?: ListQuery): Observable<PagedResult<Deployment>>;
  abstract all(): Observable<Deployment[]>;
  abstract byId(id: string): Observable<Deployment | undefined>;
  abstract dataStores(query?: ListQuery): Observable<PagedResult<DataStore>>;
  abstract dataStoreById(id: string): Observable<DataStore | undefined>;
}

export abstract class IntegrationsService {
  abstract providers(): Observable<IntegrationProvider[]>;
  abstract tenantIntegrations(query?: ListQuery): Observable<PagedResult<TenantIntegration>>;
}

export abstract class SecurityService {
  abstract alerts(): Observable<SecurityAlert[]>;
  abstract identityProviders(): Observable<IdentityProvider[]>;
  abstract policies(): Observable<AuthenticationPolicy[]>;
  abstract domains(): Observable<VerifiedDomain[]>;
  abstract sessions(): Observable<ActiveSession[]>;
  abstract serviceAccounts(query?: ListQuery): Observable<PagedResult<ServiceAccount>>;
  abstract featureFlags(query?: ListQuery): Observable<PagedResult<FeatureFlag>>;
  abstract invitations(query?: ListQuery): Observable<PagedResult<Invitation>>;
  abstract updateInvitation(id: string, status: Invitation['status']): Observable<Invitation | undefined>;
  abstract createInvitation(payload: Partial<Invitation>): Observable<Invitation>;
}

export abstract class AuditService {
  abstract list(query?: ListQuery): Observable<PagedResult<AuditEvent>>;
  abstract recent(count: number): Observable<AuditEvent[]>;
  abstract byId(id: string): Observable<AuditEvent | undefined>;
}

export interface PlatformOverview {
  kpis: KpiMetric[];
  health: HealthSignal[];
  tenantGrowth: TrendPoint[];
  userGrowth: TrendPoint[];
  subscriptionDistribution: TrendPoint[];
  licenseUtilization: { label: string; used: number; total: number }[];
}

export abstract class PlatformService {
  abstract overview(): Observable<PlatformOverview>;
  abstract regions(): Observable<PlatformRegion[]>;
  abstract environments(): Observable<PlatformEnvironment[]>;
  abstract diagnostics(): Observable<HealthSignal[]>;
}
