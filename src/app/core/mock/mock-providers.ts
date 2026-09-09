import { Provider } from '@angular/core';
import {
  ApplicationsService,
  AuditService,
  DeploymentsService,
  IntegrationsService,
  LicensesService,
  OrganizationsService,
  PlansService,
  PlatformService,
  ProductsService,
  ProvisioningService,
  RolesService,
  SecurityService,
  SubscriptionsService,
  TenantsService,
  UsageService,
  UsersService,
} from '../services/data-contracts';
import { MockApplicationsService } from './mock-applications.service';
import { MockAuditService } from './mock-audit.service';
import { MockDeploymentsService } from './mock-deployments.service';
import { MockIntegrationsService } from './mock-integrations.service';
import { MockLicensesService } from './mock-licenses.service';
import { MockOrganizationsService } from './mock-organizations.service';
import { MockPlansService } from './mock-plans.service';
import { MockPlatformService } from './mock-platform.service';
import { MockProductsService } from './mock-products.service';
import { MockProvisioningService } from './mock-provisioning.service';
import { MockRolesService } from './mock-roles.service';
import { MockSecurityService } from './mock-security.service';
import { MockSubscriptionsService } from './mock-subscriptions.service';
import { MockTenantsService } from './mock-tenants.service';
import { MockUsageService } from './mock-usage.service';
import { UsersApiService } from '../services/users-api.service';

/**
 * Single wiring point between the UI and its data layer.
 *
 * Swapping to the real backend is a one-line change per domain — for example
 * `{ provide: UsersService, useClass: UsersApiService }` — with no page edits.
 */
export const MOCK_DATA_PROVIDERS: Provider[] = [
  { provide: PlatformService, useClass: MockPlatformService },
  { provide: UsersService, useClass: UsersApiService },
  { provide: OrganizationsService, useClass: MockOrganizationsService },
  { provide: TenantsService, useClass: MockTenantsService },
  { provide: ProductsService, useClass: MockProductsService },
  { provide: ApplicationsService, useClass: MockApplicationsService },
  { provide: RolesService, useClass: MockRolesService },
  { provide: PlansService, useClass: MockPlansService },
  { provide: SubscriptionsService, useClass: MockSubscriptionsService },
  { provide: LicensesService, useClass: MockLicensesService },
  { provide: UsageService, useClass: MockUsageService },
  { provide: ProvisioningService, useClass: MockProvisioningService },
  { provide: DeploymentsService, useClass: MockDeploymentsService },
  { provide: IntegrationsService, useClass: MockIntegrationsService },
  { provide: SecurityService, useClass: MockSecurityService },
  { provide: AuditService, useClass: MockAuditService },
];
