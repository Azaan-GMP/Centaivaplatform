import {
  DataStore,
  DataStoreProvider,
  DataStoreRoute,
  Deployment,
  DeploymentRelease,
  EnvironmentName,
  IntegrationProvider,
  PlatformEnvironment,
  PlatformRegion,
  ProvisioningRun,
  ProvisioningStatus,
  ProvisioningTemplate,
  RegionName,
  TenantIntegration,
  TimelineEntry,
} from '../../models';
import { daysAgo, intBetween, minutesAgo, pick, seeded } from '../mock-utils';
import { PRODUCTS } from './seed-catalog';
import { TENANTS } from './seed-tenants';

const REGIONS: RegionName[] = ['UK South', 'UK West', 'EU West', 'US East'];
const ENVIRONMENTS: EnvironmentName[] = ['Development', 'QA', 'Staging', 'Production'];

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* =========================================================
   Regions and environments
   ========================================================= */

export const PLATFORM_REGIONS: PlatformRegion[] = [
  { id: 'reg-uk-south', name: 'UK South', code: 'uk-south', location: 'London, United Kingdom', status: 'Healthy', deploymentCount: 0, productCount: 6, tenantCount: 0, dataResidency: 'United Kingdom', latencyMs: 24 },
  { id: 'reg-uk-west', name: 'UK West', code: 'uk-west', location: 'Cardiff, United Kingdom', status: 'Healthy', deploymentCount: 0, productCount: 4, tenantCount: 0, dataResidency: 'United Kingdom', latencyMs: 31 },
  { id: 'reg-eu-west', name: 'EU West', code: 'eu-west', location: 'Amsterdam, Netherlands', status: 'Warning', deploymentCount: 0, productCount: 3, tenantCount: 0, dataResidency: 'European Union', latencyMs: 47 },
  { id: 'reg-us-east', name: 'US East', code: 'us-east', location: 'Virginia, United States', status: 'Healthy', deploymentCount: 0, productCount: 2, tenantCount: 0, dataResidency: 'United States', latencyMs: 88 },
];

export const PLATFORM_ENVIRONMENTS: PlatformEnvironment[] = [
  { id: 'env-development', name: 'Development', key: 'dev', status: 'Healthy', deploymentCount: 0, productCount: 6, tenantCount: 0, description: 'Engineering sandbox refreshed nightly from anonymised data.', protectedEnvironment: false },
  { id: 'env-qa', name: 'QA', key: 'qa', status: 'Healthy', deploymentCount: 0, productCount: 5, tenantCount: 0, description: 'Automated regression and integration verification environment.', protectedEnvironment: false },
  { id: 'env-staging', name: 'Staging', key: 'stg', status: 'Warning', deploymentCount: 0, productCount: 5, tenantCount: 0, description: 'Production mirror used for release candidate validation.', protectedEnvironment: true },
  { id: 'env-production', name: 'Production', key: 'prod', status: 'Healthy', deploymentCount: 0, productCount: 6, tenantCount: 0, description: 'Live customer environment with change control enforced.', protectedEnvironment: true },
];

/* =========================================================
   Data stores
   ========================================================= */

function buildDataStores(): DataStore[] {
  const rnd = seeded(6420);
  const providers: DataStoreProvider[] = ['Azure SQL', 'PostgreSQL', 'Cosmos DB', 'Azure Blob', 'Redis'];
  const stores: DataStore[] = [];

  for (const region of REGIONS) {
    for (const environment of ENVIRONMENTS) {
      if (region === 'US East' && environment !== 'Production') continue;
      if (region === 'UK West' && environment === 'Development') continue;

      const provider = providers[stores.length % 3]!;
      const id = `ds-${slug(region)}-${slug(environment)}-01`;
      const capacity = intBetween(200, 2000, rnd);

      const routes: DataStoreRoute[] = TENANTS.filter(
        (tenant) => tenant.region === region && tenant.environment === environment,
      ).flatMap((tenant) =>
        tenant.productKeys.map((productKey) => ({
          tenantId: tenant.id,
          tenantName: tenant.name,
          productName: PRODUCTS.find((product) => product.key === productKey)?.name ?? productKey,
          environment: tenant.environment,
          schema: `${slug(tenant.key).replace(/-/g, '_')}`,
          status: tenant.status === 'Provisioning' ? 'Migrating' : tenant.status === 'Suspended' ? 'Suspended' : 'Active',
        })),
      );

      stores.push({
        id,
        name: `ctv-${slug(region)}-${slug(environment)}-sql-01`,
        provider,
        server: `ctv-${slug(region)}-${slug(environment)}.database.centaiva.net`,
        database: `centaiva_${slug(environment).replace(/-/g, '_')}`,
        region,
        environment,
        tenantCount: new Set(routes.map((route) => route.tenantId)).size,
        status: region === 'EU West' && environment === 'Staging' ? 'Warning' : 'Healthy',
        sizeGb: Math.round(capacity * (0.2 + rnd() * 0.6)),
        capacityGb: capacity,
        connectionMasked: `Server=ctv-${slug(region)}-${slug(environment)};Database=centaiva;User Id=ctv_app;Password=••••••••••••`,
        lastBackupAt: minutesAgo(intBetween(20, 700, rnd)),
        routes,
        products: [...new Set(routes.map((route) => route.productName))],
      });
    }
  }

  return stores;
}

export const DATA_STORES: DataStore[] = buildDataStores();

/* =========================================================
   Deployments
   ========================================================= */

function buildDeployments(): Deployment[] {
  const rnd = seeded(1122);
  const deployments: Deployment[] = [];

  for (const product of PRODUCTS) {
    const productRegions: RegionName[] =
      product.key === 'MEDPURE'
        ? ['UK South', 'UK West']
        : product.key === 'CENTAIVA_AI'
          ? ['UK South', 'EU West']
          : product.key === 'WORKWELL_FINANCE'
            ? ['UK South', 'EU West', 'US East']
            : ['UK South', 'UK West', 'EU West'];

    for (const region of productRegions) {
      const environments: EnvironmentName[] = region === 'US East' ? ['Production'] : ['Production', 'Staging'];

      for (const environment of environments) {
        const dataStore = DATA_STORES.find((store) => store.region === region && store.environment === environment) ?? DATA_STORES[0]!;
        const tenantCount = TENANTS.filter(
          (tenant) => tenant.region === region && tenant.environment === environment && tenant.productKeys.includes(product.key),
        ).length;

        const releases: DeploymentRelease[] = [
          { id: `rel-${deployments.length}-1`, version: product.version, releasedAt: daysAgo(intBetween(2, 30, rnd)), releasedBy: 'Elliot Frost', notes: 'Rolling release with zero downtime migration.', status: 'Current' },
          { id: `rel-${deployments.length}-2`, version: '4.7.9', releasedAt: daysAgo(intBetween(35, 80, rnd)), releasedBy: 'Elliot Frost', notes: 'Performance improvements to the approval queue.', status: 'Superseded' },
          { id: `rel-${deployments.length}-3`, version: '4.7.5', releasedAt: daysAgo(intBetween(85, 140, rnd)), releasedBy: 'Callum Reid', notes: 'Rolled back after an integration regression.', status: 'Rolled Back' },
        ];

        deployments.push({
          id: `dep-${slug(product.key)}-${slug(region)}-${slug(environment)}`,
          name: `${product.name} — ${region} ${environment}`,
          productKey: product.key,
          productName: product.name,
          region,
          environment,
          baseUrl: `https://${slug(product.key).replace(/-/g, '')}.${slug(region)}.${environment === 'Production' ? 'centaiva.com' : 'centaiva-stg.com'}`,
          version: product.version,
          tenantCount,
          status:
            region === 'EU West' && environment === 'Staging'
              ? 'Degraded'
              : product.key === 'CENTAIVA_AI' && environment === 'Staging'
                ? 'Maintenance'
                : 'Healthy',
          uptimePercent: Number((99.2 + rnd() * 0.79).toFixed(2)),
          latencyMs: intBetween(38, 220, rnd),
          dataStoreId: dataStore.id,
          dataStoreName: dataStore.name,
          lastReleasedAt: releases[0]!.releasedAt,
          releases,
        });
      }
    }
  }

  return deployments;
}

export const DEPLOYMENTS: Deployment[] = buildDeployments();

for (const region of PLATFORM_REGIONS) {
  region.deploymentCount = DEPLOYMENTS.filter((deployment) => deployment.region === region.name).length;
  region.tenantCount = TENANTS.filter((tenant) => tenant.region === region.name).length;
}

for (const environment of PLATFORM_ENVIRONMENTS) {
  environment.deploymentCount = DEPLOYMENTS.filter((deployment) => deployment.environment === environment.name).length;
  environment.tenantCount = TENANTS.filter((tenant) => tenant.environment === environment.name).length;
}

/* =========================================================
   Provisioning
   ========================================================= */

const STEP_NAMES = [
  'Validate Subscription',
  'Resolve Deployment',
  'Create Tenant Configuration',
  'Assign Data Store',
  'Configure Integrations',
  'Initialize Product',
  'Complete',
];

export const PROVISIONING_TEMPLATES: ProvisioningTemplate[] = [
  { id: 'tpl-ww-ts-standard', name: 'WorkWell Timesheets — Standard', key: 'WW_TS_STANDARD', productKey: 'WORKWELL_TIMESHEETS', productName: 'WorkWell Timesheets', version: '4.2', stepCount: 7, runCount: 184, status: 'Active', updatedAt: daysAgo(12), description: 'Default seven step provisioning flow for new timesheet tenants.' },
  { id: 'tpl-ww-ts-enterprise', name: 'WorkWell Timesheets — Enterprise', key: 'WW_TS_ENTERPRISE', productKey: 'WORKWELL_TIMESHEETS', productName: 'WorkWell Timesheets', version: '2.1', stepCount: 11, runCount: 41, status: 'Active', updatedAt: daysAgo(28), description: 'Adds dedicated data store allocation and custom integration wiring.' },
  { id: 'tpl-ww-fin-standard', name: 'WorkWell Finance — Standard', key: 'WW_FIN_STANDARD', productKey: 'WORKWELL_FINANCE', productName: 'WorkWell Finance', version: '3.0', stepCount: 8, runCount: 96, status: 'Active', updatedAt: daysAgo(6), description: 'Provisions the finance workspace including ledger connector scaffolding.' },
  { id: 'tpl-medpure-nhs', name: 'MedPure — NHS Trust', key: 'MEDPURE_NHS', productKey: 'MEDPURE', productName: 'MedPure', version: '1.8', stepCount: 12, runCount: 17, status: 'Active', updatedAt: daysAgo(44), description: 'Clinical provisioning with data residency assertions and audit sign-off.' },
  { id: 'tpl-ai-preview', name: 'Centaiva AI — Preview', key: 'CTV_AI_PREVIEW', productKey: 'CENTAIVA_AI', productName: 'Centaiva AI', version: '0.9', stepCount: 6, runCount: 9, status: 'Draft', updatedAt: daysAgo(3), description: 'Preview template pending sign-off for the extraction pipeline rollout.' },
  { id: 'tpl-identity-base', name: 'Centaiva Identity — Base', key: 'CTV_IDENTITY_BASE', productKey: 'CENTAIVA_IDENTITY', productName: 'Centaiva Identity', version: '5.0', stepCount: 5, runCount: 212, status: 'Active', updatedAt: daysAgo(60), description: 'Creates the identity realm, default policies and federation stubs.' },
  { id: 'tpl-legacy-v1', name: 'Legacy Tenant Bootstrap', key: 'LEGACY_BOOTSTRAP', productKey: 'CENTAIVA_PLATFORM', productName: 'Centaiva Platform', version: '1.0', stepCount: 4, runCount: 302, status: 'Deprecated', updatedAt: daysAgo(410), description: 'Superseded by product specific templates. Retained for audit history.' },
];

function buildSteps(status: ProvisioningStatus, rnd: () => number): TimelineEntry[] {
  const failIndex = status === 'Failed' ? intBetween(2, 5, rnd) : -1;
  const activeIndex = status === 'Running' ? intBetween(1, 5, rnd) : status === 'Pending' ? 0 : STEP_NAMES.length;

  return STEP_NAMES.map((name, index) => {
    let stepStatus: TimelineEntry['status'] = 'complete';
    if (failIndex >= 0) {
      stepStatus = index < failIndex ? 'complete' : index === failIndex ? 'failed' : 'pending';
    } else if (status === 'Running' || status === 'Pending') {
      stepStatus = index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'pending';
    }

    return {
      id: `step-${index + 1}`,
      title: name,
      description:
        index === 0
          ? 'Confirms an active subscription and seat availability.'
          : index === 1
            ? 'Selects the deployment for the product, region and environment.'
            : index === 2
              ? 'Writes tenant configuration and feature defaults.'
              : index === 3
                ? 'Binds the tenant to a data store and creates its schema.'
                : index === 4
                  ? 'Registers integration connectors declared by the template.'
                  : index === 5
                    ? 'Seeds reference data and initialises the product workspace.'
                    : 'Marks the run complete and emits the provisioning audit event.',
      timestamp: minutesAgo(intBetween(1, 400, rnd)),
      status: stepStatus,
      durationMs: stepStatus === 'complete' ? intBetween(400, 26_000, rnd) : undefined,
    };
  });
}

function buildProvisioningRuns(): ProvisioningRun[] {
  const rnd = seeded(3344);

  return Array.from({ length: 32 }, (_, index) => {
    const tenant = TENANTS[(index * 3) % TENANTS.length]!;
    const productKey = tenant.productKeys[0]!;
    const template =
      PROVISIONING_TEMPLATES.find((candidate) => candidate.productKey === productKey) ?? PROVISIONING_TEMPLATES[0]!;

    const status: ProvisioningStatus =
      index === 0 || index === 4 ? 'Running' : index === 2 ? 'Pending' : index % 9 === 5 ? 'Failed' : 'Completed';

    return {
      id: `RUN-${String(9200 - index * 7)}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      productKey,
      productName: PRODUCTS.find((product) => product.key === productKey)?.name ?? productKey,
      templateId: template.id,
      templateName: template.name,
      environment: tenant.environment,
      status,
      startedAt: minutesAgo(index * 47 + intBetween(2, 40, rnd)),
      durationMs: status === 'Running' || status === 'Pending' ? 0 : intBetween(24_000, 460_000, rnd),
      triggeredBy: pick(['Talha Hassan', 'Sarah Ahmed', 'Onboarding Wizard', 'System'], rnd),
      steps: buildSteps(status, rnd),
    } satisfies ProvisioningRun;
  });
}

export const PROVISIONING_RUNS: ProvisioningRun[] = buildProvisioningRuns();

/* =========================================================
   Integrations
   ========================================================= */

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  { id: 'ipv-xero', name: 'Xero', key: 'XERO', category: 'Accounting', protocol: 'OAuth 2.0', status: 'Connected', configuredTenants: 14, description: 'Two way ledger, contact and invoice synchronisation.', accent: '#13b5ea', icon: 'pi pi-book' },
  { id: 'ipv-evertime', name: 'Evertime', key: 'EVERTIME', category: 'Time Tracking', protocol: 'REST + Webhook', status: 'Connected', configuredTenants: 9, description: 'Clock-in device feed used for site level attendance capture.', accent: '#1a73e8', icon: 'pi pi-clock' },
  { id: 'ipv-m365', name: 'Microsoft 365', key: 'MICROSOFT_365', category: 'Productivity', protocol: 'Microsoft Graph', status: 'Connected', configuredTenants: 22, description: 'Calendar, mail and directory synchronisation for tenant users.', accent: '#0078d4', icon: 'pi pi-microsoft' },
  { id: 'ipv-sendgrid', name: 'SendGrid', key: 'SENDGRID', category: 'Messaging', protocol: 'REST API', status: 'Error', configuredTenants: 26, description: 'Transactional email delivery for invitations and notifications.', accent: '#1a82e2', icon: 'pi pi-send' },
  { id: 'ipv-azure-storage', name: 'Azure Storage', key: 'AZURE_STORAGE', category: 'Storage', protocol: 'Azure SDK', status: 'Connected', configuredTenants: 18, description: 'Document and attachment blob storage per tenant container.', accent: '#0f6cbd', icon: 'pi pi-database' },
  { id: 'ipv-n8n', name: 'n8n', key: 'N8N', category: 'Automation', protocol: 'Webhook', status: 'Available', configuredTenants: 4, description: 'Low code workflow automation across Centaiva products.', accent: '#ea4b71', icon: 'pi pi-sitemap' },
];

function buildTenantIntegrations(): TenantIntegration[] {
  const rnd = seeded(5566);
  const rows: TenantIntegration[] = [];

  TENANTS.forEach((tenant, index) => {
    const providerCount = 1 + (index % 3);
    for (let i = 0; i < providerCount; i++) {
      const provider = INTEGRATION_PROVIDERS[(index + i) % INTEGRATION_PROVIDERS.length]!;
      const productKey = tenant.productKeys[i % tenant.productKeys.length]!;

      rows.push({
        id: `tin-${tenant.id}-${provider.key.toLowerCase()}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        providerKey: provider.key,
        providerName: provider.name,
        productName: PRODUCTS.find((product) => product.key === productKey)?.name ?? productKey,
        environment: tenant.environment,
        status:
          provider.key === 'SENDGRID' && index % 5 === 0
            ? 'Error'
            : tenant.status === 'Provisioning'
              ? 'Pending'
              : tenant.status === 'Suspended'
                ? 'Disabled'
                : 'Connected',
        lastSyncAt: minutesAgo(intBetween(2, 3000, rnd)),
        syncedRecords: intBetween(120, 84_000, rnd),
        connectionMasked: `client_id=ctv-${slug(provider.key)}-••••••••; secret=••••••••••••`,
      });
    }
  });

  return rows;
}

export const TENANT_INTEGRATIONS: TenantIntegration[] = buildTenantIntegrations();

for (const provider of INTEGRATION_PROVIDERS) {
  provider.configuredTenants = new Set(
    TENANT_INTEGRATIONS.filter((row) => row.providerKey === provider.key).map((row) => row.tenantId),
  ).size;
}
