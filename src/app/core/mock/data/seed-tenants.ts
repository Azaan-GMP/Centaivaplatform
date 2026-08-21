import {
  EnvironmentName,
  Tenant,
  TenantDataRoute,
  TenantMember,
  TenantProduct,
  TenantStatus,
} from '../../models';
import { daysAgo, intBetween, pick, seeded } from '../mock-utils';
import { ORGANIZATIONS } from './seed-organizations';
import { PRODUCTS } from './seed-catalog';

interface TenantSeed {
  name: string;
  key: string;
  orgKey: string;
  environment: EnvironmentName;
  status: TenantStatus;
  products: string[];
  contact: string;
}

const TENANT_SEEDS: TenantSeed[] = [
  { name: 'Alpha Group Production', key: 'ALPHA-PROD', orgKey: 'CUST-ALPHA', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE', 'CENTAIVA_AI'], contact: 'Emily Carter' },
  { name: 'Alpha Group Staging', key: 'ALPHA-STG', orgKey: 'CUST-ALPHA', environment: 'Staging', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Emily Carter' },
  { name: 'Alpha Construction', key: 'ALPHA-CONS', orgKey: 'ALPHA-CONSTRUCTION', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Daniel Reid' },
  { name: 'Alpha Manchester Site', key: 'ALPHA-MAN', orgKey: 'ALPHA-SITE-MAN', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Priya Nair' },
  { name: 'Alpha Leeds Site', key: 'ALPHA-LDS', orgKey: 'ALPHA-SITE-LDS', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Owen Bradley' },
  { name: 'Alpha Facilities', key: 'ALPHA-FAC', orgKey: 'ALPHA-FACILITIES', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'], contact: 'Grace Kelly' },
  { name: 'Beta Retail Production', key: 'BETA-PROD', orgKey: 'CUST-BETA', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'David Wilson' },
  { name: 'Beta Retail North', key: 'BETA-NORTH', orgKey: 'BETA-NORTH', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Hannah Price' },
  { name: 'Gamma Logistics Trial', key: 'GAMMA-TRIAL', orgKey: 'CUST-GAMMA', environment: 'QA', status: 'Provisioning', products: ['WORKWELL_FINANCE'], contact: 'Marcus Lee' },
  { name: 'Nordkraft Production', key: 'NORDKRAFT-PROD', orgKey: 'CUST-NORDKRAFT', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'CENTAIVA_AI'], contact: 'Lars Pedersen' },
  { name: 'Vantage BV Production', key: 'VANTAGE-PROD', orgKey: 'CUST-VANTAGE', environment: 'Production', status: 'Active', products: ['WORKWELL_FINANCE'], contact: 'Anneke de Vries' },
  { name: 'Northside Trust Clinical', key: 'NORTHSIDE-CLIN', orgKey: 'NORTHSIDE-TRUST', environment: 'Production', status: 'Active', products: ['MEDPURE'], contact: 'Fiona Grant' },
  { name: 'MedPure Pharmacy Network', key: 'MEDPURE-PHARM', orgKey: 'MEDPURE-PHARMACY', environment: 'Production', status: 'Active', products: ['MEDPURE', 'CENTAIVA_AI'], contact: 'Tom Whitfield' },
  { name: 'MedPure Clinical Sandbox', key: 'MEDPURE-SBX', orgKey: 'MEDPURE-CLINICAL', environment: 'Development', status: 'Active', products: ['MEDPURE'], contact: 'Robert Hale' },
  { name: 'Delta Works Production', key: 'DELTA-PROD', orgKey: 'CUST-DELTA', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Ryan Foster' },
  { name: 'Delta Field Services', key: 'DELTA-FIELD', orgKey: 'DELTA-FIELD', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Megan Doyle' },
  { name: 'Epsilon Holdings Pilot', key: 'EPSILON-PILOT', orgKey: 'CUST-EPSILON', environment: 'QA', status: 'Active', products: ['CENTAIVA_AI'], contact: 'Peter Nash' },
  { name: 'Helix Inc Production', key: 'HELIX-PROD', orgKey: 'CUST-HELIX', environment: 'Production', status: 'Active', products: ['WORKWELL_FINANCE'], contact: 'Alicia Moreno' },
  { name: 'Reseller A1 Demo', key: 'RESELLER-A1-DEMO', orgKey: 'RESELLER-A1', environment: 'Development', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'], contact: 'Chloe Bennett' },
  { name: 'Reseller A2 Demo', key: 'RESELLER-A2-DEMO', orgKey: 'RESELLER-A2', environment: 'Development', status: 'Suspended', products: ['WORKWELL_TIMESHEETS'], contact: 'Marta Kowalski' },
  { name: 'Partner A Sandbox', key: 'PARTNER-A-SBX', orgKey: 'PARTNER-A', environment: 'Staging', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'CENTAIVA_AI'], contact: 'Ian McAllister' },
  { name: 'Partner B Sandbox', key: 'PARTNER-B-SBX', orgKey: 'PARTNER-B', environment: 'Staging', status: 'Active', products: ['WORKWELL_FINANCE'], contact: 'Jordan Blake' },
  { name: 'WorkWell UK Internal', key: 'WW-UK-INT', orgKey: 'WORKWELL-UK', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'], contact: 'John Smith' },
  { name: 'WorkWell EU Internal', key: 'WW-EU-INT', orgKey: 'WORKWELL-EU', environment: 'Production', status: 'Active', products: ['WORKWELL_TIMESHEETS'], contact: 'Sofia Lindqvist' },
  { name: 'Centaiva Platform Control', key: 'CTV-CONTROL', orgKey: 'CENTAIVA', environment: 'Production', status: 'Active', products: ['CENTAIVA_PLATFORM', 'CENTAIVA_IDENTITY'], contact: 'Talha Hassan' },
  { name: 'Centaiva Internal Staff', key: 'CTV-STAFF', orgKey: 'CENTAIVA-INTERNAL', environment: 'Production', status: 'Active', products: ['CENTAIVA_PLATFORM', 'CENTAIVA_IDENTITY', 'CENTAIVA_AI'], contact: 'Talha Hassan' },
  { name: 'Centaiva Identity QA', key: 'CTV-ID-QA', orgKey: 'CENTAIVA', environment: 'QA', status: 'Active', products: ['CENTAIVA_IDENTITY'], contact: 'Talha Hassan' },
  { name: 'Centaiva AI Preview', key: 'CTV-AI-PREVIEW', orgKey: 'CENTAIVA', environment: 'Staging', status: 'Provisioning', products: ['CENTAIVA_AI'], contact: 'Nadia Farouk' },
];

const TENANT_MEMBER_NAMES = [
  'Aaron Blake', 'Bella Novak', 'Callum Reid', 'Divya Shah', 'Elliot Frost',
  'Farah Nasser', 'George Hart', 'Helena Voss', 'Idris Khan', 'Jasmine Poole',
  'Kieran Doyle', 'Lucia Marchetti', 'Mason Clarke', 'Nina Petrova', 'Omar Haddad',
];

const MEMBER_ROLES = ['Tenant Admin', 'Timesheet Reviewer', 'Timesheet Admin', 'Finance Admin', 'Read Only'];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildTenants(): Tenant[] {
  const rnd = seeded(31337);

  return TENANT_SEEDS.map((seed, index) => {
    const organization = ORGANIZATIONS.find((org) => org.key === seed.orgKey)!;
    const id = `tnt-${slugify(seed.key)}`;
    const memberCount = intBetween(6, 84, rnd);
    const seats = Math.max(memberCount, intBetween(memberCount, memberCount + 60, rnd));
    const seatsUsed = Math.round(seats * (0.5 + rnd() * 0.45));

    const members: TenantMember[] = Array.from({ length: Math.min(memberCount, 8) }, (_, i) => {
      const name = TENANT_MEMBER_NAMES[(i + index) % TENANT_MEMBER_NAMES.length]!;
      return {
        id: `${id}-mem-${i + 1}`,
        userId: `usr-${slugify(name)}`,
        name,
        email: `${slugify(name).replace(/-/g, '.')}@${slugify(organization.name)}.com`,
        role: MEMBER_ROLES[(i + index) % MEMBER_ROLES.length]!,
        products: seed.products.slice(0, 1 + (i % seed.products.length)),
        status: i === 5 ? 'Invited' : i === 6 ? 'Disabled' : 'Active',
        lastActiveAt: daysAgo(intBetween(0, 30, rnd)),
      } satisfies TenantMember;
    });

    const products: TenantProduct[] = seed.products.map((productKey, i) => {
      const product = PRODUCTS.find((p) => p.key === productKey)!;
      const productSeats = Math.max(5, Math.round(seats / seed.products.length));
      return {
        productKey,
        productName: product.name,
        planName: pick(['Starter', 'Professional', 'Business', 'Enterprise'], rnd),
        subscriptionId: `sub-${slugify(seed.key)}-${i + 1}`,
        status: seed.status === 'Provisioning' ? 'Provisioning' : 'Active',
        activatedAt: daysAgo(intBetween(30, 700, rnd)),
        seats: productSeats,
        seatsUsed: Math.round(productSeats * (0.45 + rnd() * 0.5)),
      } satisfies TenantProduct;
    });

    const dataRoutes: TenantDataRoute[] = seed.products.map((productKey) => {
      const product = PRODUCTS.find((p) => p.key === productKey)!;
      const regionSlug = slugify(organization.region);
      return {
        productKey,
        productName: product.name,
        environment: seed.environment,
        deploymentId: `dep-${slugify(product.key)}-${regionSlug}-${slugify(seed.environment)}`,
        deploymentName: `${product.name} — ${organization.region} ${seed.environment}`,
        dataStoreId: `ds-${regionSlug}-${slugify(seed.environment)}-01`,
        dataStoreName: `ctv-${regionSlug}-${slugify(seed.environment)}-sql-01`,
        region: organization.region,
      } satisfies TenantDataRoute;
    });

    const storageQuota = intBetween(50, 500, rnd);

    return {
      id,
      name: seed.name,
      key: seed.key,
      slug: slugify(seed.name),
      organizationId: organization.id,
      organizationName: organization.name,
      region: organization.region,
      environment: seed.environment,
      status: seed.status,
      createdAt: daysAgo(intBetween(30, 800, rnd)),
      memberCount,
      productKeys: seed.products,
      subscriptionStatus: seed.status === 'Provisioning' ? 'Trial' : index % 9 === 4 ? 'Past Due' : 'Active',
      licenseSeats: seats,
      licenseSeatsUsed: seatsUsed,
      storageUsedGb: Math.round(storageQuota * (0.2 + rnd() * 0.7)),
      storageQuotaGb: storageQuota,
      members,
      products,
      dataRoutes,
      securityPolicy: {
        requireMfa: index % 3 !== 0,
        allowPasswordLogin: index % 4 !== 0,
        allowExternalIdentityProviders: true,
        sessionTimeoutMinutes: pick([30, 60, 120, 480], rnd),
        maxFailedAttempts: pick([3, 5, 10], rnd),
        minimumPasswordLength: pick([10, 12, 14], rnd),
        requireVerifiedEmail: true,
      },
      primaryContact: seed.contact,
    } satisfies Tenant;
  });
}

export const TENANTS: Tenant[] = buildTenants();

/* Backfill the derived counters that the hierarchy pages surface. */
for (const organization of ORGANIZATIONS) {
  organization.tenantCount = TENANTS.filter((tenant) => tenant.organizationId === organization.id).length;
}

for (const product of PRODUCTS) {
  product.tenantCount = TENANTS.filter((tenant) => tenant.productKeys.includes(product.key)).length;
}
