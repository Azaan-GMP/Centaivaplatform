import {
  ConcurrentLease,
  Entitlement,
  License,
  LicenseActivation,
  LicenseHistoryEntry,
  LicenseLimit,
  LicensePool,
  LicenseSeat,
  LicenseType,
  Plan,
  PlanEntitlementValue,
  PlanVersion,
  Subscription,
  SubscriptionStatus,
} from '../../models';
import { daysAgo, daysAhead, intBetween, minutesAgo, pick, seeded } from '../mock-utils';
import { PRODUCTS } from './seed-catalog';
import { TENANTS } from './seed-tenants';
import { USERS } from './seed-users';

/* =========================================================
   Entitlements
   ========================================================= */

interface EntitlementSeed {
  name: string;
  key: string;
  productKey: string;
  type: Entitlement['type'];
  valueType: Entitlement['valueType'];
  defaultValue: string;
  unit: string | null;
  description: string;
  status?: Entitlement['status'];
}

const ENTITLEMENT_SEEDS: EntitlementSeed[] = [
  { name: 'AI Extraction', key: 'AI_EXTRACTION', productKey: 'CENTAIVA_AI', type: 'Feature Toggle', valueType: 'Boolean', defaultValue: 'false', unit: null, description: 'Enables the document extraction pipeline for the tenant.' },
  { name: 'Maximum Users', key: 'MAX_USERS', productKey: 'CENTAIVA_PLATFORM', type: 'Limit', valueType: 'Integer', defaultValue: '25', unit: 'users', description: 'Hard ceiling on active user accounts within the tenant.' },
  { name: 'Maximum Timesheets Monthly', key: 'MAX_TIMESHEETS_MONTHLY', productKey: 'WORKWELL_TIMESHEETS', type: 'Quota', valueType: 'Integer', defaultValue: '5000', unit: 'timesheets', description: 'Monthly timesheet submission allowance.' },
  { name: 'Advanced Reporting', key: 'ADVANCED_REPORTING', productKey: 'WORKWELL_TIMESHEETS', type: 'Feature Toggle', valueType: 'Boolean', defaultValue: 'false', unit: null, description: 'Unlocks cross-site analytics and custom report builder.' },
  { name: 'API Access', key: 'API_ACCESS', productKey: 'CENTAIVA_PLATFORM', type: 'Feature Toggle', valueType: 'Boolean', defaultValue: 'false', unit: null, description: 'Grants the tenant access to public REST endpoints.' },
  { name: 'Multi Entity Support', key: 'MULTI_ENTITY_SUPPORT', productKey: 'WORKWELL_FINANCE', type: 'Feature Toggle', valueType: 'Boolean', defaultValue: 'false', unit: null, description: 'Allows consolidated reporting across legal entities.' },
  { name: 'Storage Allowance', key: 'STORAGE_ALLOWANCE_GB', productKey: 'WORKWELL_FINANCE', type: 'Quota', valueType: 'Integer', defaultValue: '50', unit: 'GB', description: 'Document storage included with the plan.' },
  { name: 'Concurrent Sessions', key: 'CONCURRENT_SESSIONS', productKey: 'CENTAIVA_IDENTITY', type: 'Limit', valueType: 'Integer', defaultValue: '2', unit: 'sessions', description: 'Concurrent authenticated sessions permitted per user.' },
  { name: 'Support Tier', key: 'SUPPORT_TIER', productKey: 'CENTAIVA_PLATFORM', type: 'Configuration', valueType: 'String', defaultValue: 'Standard', unit: null, description: 'Contractual support response tier.' },
  { name: 'Retention Period', key: 'AUDIT_RETENTION_DAYS', productKey: 'CENTAIVA_PLATFORM', type: 'Configuration', valueType: 'Integer', defaultValue: '90', unit: 'days', description: 'Audit event retention window for the tenant.' },
  { name: 'Controlled Drug Register', key: 'CD_REGISTER', productKey: 'MEDPURE', type: 'Feature Toggle', valueType: 'Boolean', defaultValue: 'true', unit: null, description: 'Enables the digital controlled drug register.' },
  { name: 'Extraction Accuracy Threshold', key: 'EXTRACTION_THRESHOLD', productKey: 'CENTAIVA_AI', type: 'Configuration', valueType: 'Decimal', defaultValue: '0.85', unit: null, description: 'Minimum confidence before a field is auto-accepted.', status: 'Draft' },
];

export const ENTITLEMENTS: Entitlement[] = ENTITLEMENT_SEEDS.map((seed, index) => {
  const product = PRODUCTS.find((p) => p.key === seed.productKey)!;
  return {
    id: `ent-${seed.key.toLowerCase().replace(/_/g, '-')}`,
    name: seed.name,
    key: seed.key,
    productKey: seed.productKey,
    productName: product.name,
    type: seed.type,
    valueType: seed.valueType,
    defaultValue: seed.defaultValue,
    unit: seed.unit,
    status: seed.status ?? 'Active',
    description: seed.description,
    planCount: 2 + (index % 3),
    createdAt: daysAgo(200 + index * 11),
  } satisfies Entitlement;
});

/* =========================================================
   Plans
   ========================================================= */

const TIERS: { tier: Plan['tier']; seats: number; price: number; highlights: string[] }[] = [
  { tier: 'Starter', seats: 10, price: 8, highlights: ['Core product access', 'Email support', 'Single environment'] },
  { tier: 'Professional', seats: 50, price: 14, highlights: ['Advanced reporting', 'API access', 'Standard support SLA'] },
  { tier: 'Business', seats: 200, price: 19, highlights: ['Multi entity support', 'Delegated administration', 'Priority support'] },
  { tier: 'Enterprise', seats: 1000, price: 26, highlights: ['Unlimited entitlements', 'Dedicated deployment', '24/7 support and DPA'] },
];

const PLAN_PRODUCTS = ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE', 'MEDPURE', 'CENTAIVA_AI'];

function entitlementValues(tier: Plan['tier'], productKey: string): PlanEntitlementValue[] {
  const relevant = ENTITLEMENTS.filter(
    (entitlement) => entitlement.productKey === productKey || entitlement.productKey === 'CENTAIVA_PLATFORM',
  );

  const multiplier = { Starter: 1, Professional: 4, Business: 12, Enterprise: 0 }[tier];

  return relevant.map((entitlement) => {
    if (entitlement.valueType === 'Boolean') {
      const enabled = tier === 'Enterprise' || tier === 'Business' || (tier === 'Professional' && entitlement.key !== 'MULTI_ENTITY_SUPPORT');
      return {
        entitlementKey: entitlement.key,
        entitlementName: entitlement.name,
        valueType: entitlement.valueType,
        value: enabled ? 'true' : 'false',
        unlimited: false,
      };
    }

    if (entitlement.valueType === 'Integer') {
      if (multiplier === 0) {
        return {
          entitlementKey: entitlement.key,
          entitlementName: entitlement.name,
          valueType: entitlement.valueType,
          value: 'Unlimited',
          unlimited: true,
        };
      }
      const base = Number(entitlement.defaultValue);
      return {
        entitlementKey: entitlement.key,
        entitlementName: entitlement.name,
        valueType: entitlement.valueType,
        value: String(base * multiplier),
        unlimited: false,
      };
    }

    return {
      entitlementKey: entitlement.key,
      entitlementName: entitlement.name,
      valueType: entitlement.valueType,
      value: tier === 'Enterprise' ? 'Premium' : entitlement.defaultValue,
      unlimited: false,
    };
  });
}

function buildPlans(): Plan[] {
  const rnd = seeded(2468);
  const plans: Plan[] = [];

  for (const productKey of PLAN_PRODUCTS) {
    const product = PRODUCTS.find((p) => p.key === productKey)!;

    for (const tierSeed of TIERS) {
      const key = `${productKey}_${tierSeed.tier.toUpperCase()}`;
      const versions: PlanVersion[] = [
        {
          id: `${key.toLowerCase()}-v3`,
          version: '3.0',
          status: 'Draft',
          effectiveFrom: daysAhead(intBetween(20, 90, rnd)),
          createdBy: 'Talha Hassan',
          createdAt: daysAgo(intBetween(2, 25, rnd)),
          notes: 'Adds usage based AI extraction bundle and revised seat pricing.',
          subscriptionCount: 0,
        },
        {
          id: `${key.toLowerCase()}-v2`,
          version: '2.0',
          status: 'Published',
          effectiveFrom: daysAgo(intBetween(120, 260, rnd)),
          createdBy: 'Sarah Ahmed',
          createdAt: daysAgo(intBetween(270, 320, rnd)),
          notes: 'Current commercial version with advanced reporting included from Professional.',
          subscriptionCount: intBetween(4, 40, rnd),
        },
        {
          id: `${key.toLowerCase()}-v1`,
          version: '1.0',
          status: 'Retired',
          effectiveFrom: daysAgo(intBetween(600, 900, rnd)),
          createdBy: 'Sarah Ahmed',
          createdAt: daysAgo(intBetween(900, 1000, rnd)),
          notes: 'Original launch version, retired after the 2.0 migration completed.',
          subscriptionCount: intBetween(0, 6, rnd),
        },
      ];

      plans.push({
        id: `pln-${key.toLowerCase().replace(/_/g, '-')}`,
        name: tierSeed.tier,
        key,
        productKey,
        productName: product.name,
        description: `${tierSeed.tier} commercial plan for ${product.name}.`,
        tier: tierSeed.tier,
        currentVersion: '2.0',
        status: productKey === 'CENTAIVA_AI' && tierSeed.tier === 'Enterprise' ? 'Draft' : 'Active',
        baseSeats: tierSeed.seats,
        pricePerSeat: tierSeed.price,
        billingCycle: tierSeed.tier === 'Starter' ? 'Monthly' : 'Annual',
        currency: 'GBP',
        subscriptionCount: versions.reduce((total, version) => total + version.subscriptionCount, 0),
        createdAt: daysAgo(intBetween(400, 1000, rnd)),
        highlights: tierSeed.highlights,
        versions,
        entitlements: entitlementValues(tierSeed.tier, productKey),
      });
    }
  }

  return plans;
}

export const PLANS: Plan[] = buildPlans();

/* =========================================================
   Subscriptions
   ========================================================= */

function buildSubscriptions(): Subscription[] {
  const rnd = seeded(1357);
  const subscriptions: Subscription[] = [];

  TENANTS.forEach((tenant, tenantIndex) => {
    tenant.products.forEach((tenantProduct, productIndex) => {
      const plan =
        PLANS.find((p) => p.productKey === tenantProduct.productKey && p.name === tenantProduct.planName) ??
        PLANS.find((p) => p.productKey === tenantProduct.productKey) ??
        PLANS[0]!;

      const status: SubscriptionStatus =
        tenant.status === 'Provisioning'
          ? 'Trial'
          : tenant.status === 'Suspended'
            ? 'Suspended'
            : (tenantIndex + productIndex) % 11 === 3
              ? 'Past Due'
              : (tenantIndex + productIndex) % 13 === 7
                ? 'Trial'
                : 'Active';

      const seats = tenantProduct.seats;

      subscriptions.push({
        id: tenantProduct.subscriptionId,
        reference: `SUB-${String(subscriptions.length + 1001).padStart(4, '0')}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        organizationName: tenant.organizationName,
        productKey: tenantProduct.productKey,
        productName: tenantProduct.productName,
        planId: plan.id,
        planName: plan.name,
        planVersion: plan.currentVersion,
        status,
        seats,
        seatsUsed: tenantProduct.seatsUsed,
        periodStart: daysAgo(intBetween(20, 300, rnd)),
        periodEnd: daysAhead(intBetween(20, 340, rnd)),
        autoRenew: (tenantIndex + productIndex) % 7 !== 2,
        billingCycle: plan.billingCycle,
        currency: plan.currency,
        amount: seats * plan.pricePerSeat * (plan.billingCycle === 'Annual' ? 12 : 1),
        createdAt: tenantProduct.activatedAt,
        trialEndsAt: status === 'Trial' ? daysAhead(intBetween(3, 25, rnd)) : null,
        licenseIds: [],
        usage: [
          { meter: 'API Calls', used: intBetween(4_000, 240_000, rnd), limit: 250_000, unit: 'calls' },
          { meter: 'Active Users', used: tenantProduct.seatsUsed, limit: seats, unit: 'users' },
          { meter: 'Storage', used: intBetween(3, 90, rnd), limit: 100, unit: 'GB' },
        ],
      });
    });
  });

  // A couple of terminated subscriptions so the status filter has coverage.
  const cancelled = subscriptions[subscriptions.length - 2];
  if (cancelled) {
    cancelled.status = 'Cancelled';
    cancelled.autoRenew = false;
  }

  return subscriptions;
}

export const SUBSCRIPTIONS: Subscription[] = buildSubscriptions();

for (const product of PRODUCTS) {
  product.subscriptionCount = SUBSCRIPTIONS.filter((subscription) => subscription.productKey === product.key).length;
}

/* =========================================================
   Licences
   ========================================================= */

const LICENSE_TYPES: LicenseType[] = ['Named User', 'Concurrent', 'Site', 'Trial', 'Device'];

function maskedKey(index: number, rnd: () => number): string {
  const tail = Array.from({ length: 4 }, () => '0123456789ABCDEF'[Math.floor(rnd() * 16)]).join('');
  return `CNTA-****-****-${tail}`;
}

function buildLicenses(): License[] {
  const rnd = seeded(8642);

  return SUBSCRIPTIONS.map((subscription, index) => {
    const tenant = TENANTS.find((t) => t.id === subscription.tenantId)!;
    const id = `lic-${subscription.id.replace('sub-', '')}`;
    const type: LicenseType = subscription.status === 'Trial' ? 'Trial' : LICENSE_TYPES[index % LICENSE_TYPES.length]!;
    const seatLimit = subscription.seats;
    const seatsUsed = Math.min(seatLimit, subscription.seatsUsed);
    const activationLimit = seatLimit * 2;
    const activationCount = intBetween(Math.floor(seatsUsed * 0.6), Math.max(1, seatsUsed), rnd);
    const concurrentLimit = Math.max(2, Math.round(seatLimit * 0.3));

    const status: License['status'] =
      subscription.status === 'Cancelled'
        ? 'Revoked'
        : subscription.status === 'Suspended'
          ? 'Suspended'
          : subscription.status === 'Past Due'
            ? 'Suspended'
            : index % 17 === 5
              ? 'Expired'
              : subscription.status === 'Trial' && index % 3 === 0
                ? 'Pending'
                : 'Active';

    const seats: LicenseSeat[] = Array.from({ length: Math.min(seatsUsed, 10) }, (_, i) => {
      const user = USERS[(index * 3 + i) % USERS.length]!;
      return {
        id: `${id}-seat-${i + 1}`,
        userId: user.id,
        userName: user.displayName,
        email: user.email,
        assignedAt: daysAgo(intBetween(10, 400, rnd)),
        lastActiveAt: minutesAgo(intBetween(5, 20_000, rnd)),
        status: i === 8 ? 'Reserved' : i === 9 ? 'Released' : 'Assigned',
        device: pick(['Windows 11 Desktop', 'MacBook Pro 14', 'iPad Pro', 'Android Tablet', 'Shared Kiosk'], rnd),
      } satisfies LicenseSeat;
    });

    const activations: LicenseActivation[] = Array.from({ length: Math.min(activationCount, 8) }, (_, i) => ({
      id: `${id}-act-${i + 1}`,
      machineName: `${tenant.key.toLowerCase()}-wks-${String(i + 1).padStart(3, '0')}`,
      fingerprint: `FP-${'ABCDEF0123456789'[Math.floor(rnd() * 16)]}${'ABCDEF0123456789'[Math.floor(rnd() * 16)]}**-****-${String(1000 + i)}`,
      user: seats[i % Math.max(seats.length, 1)]?.userName ?? 'Unassigned',
      ipAddress: `10.${intBetween(0, 255, rnd)}.${intBetween(0, 255, rnd)}.${intBetween(2, 250, rnd)}`,
      environment: tenant.environment,
      activatedAt: daysAgo(intBetween(1, 300, rnd)),
      lastHeartbeat: minutesAgo(intBetween(1, 4000, rnd)),
      status: i === 6 ? 'Stale' : i === 7 ? 'Revoked' : 'Active',
    }));

    const leases: ConcurrentLease[] = Array.from({ length: Math.min(concurrentLimit, 5) }, (_, i) => ({
      id: `${id}-lease-${i + 1}`,
      user: seats[i % Math.max(seats.length, 1)]?.userName ?? 'Unassigned',
      sessionId: `ses-${id}-${i + 1}`,
      acquiredAt: minutesAgo(intBetween(5, 300, rnd)),
      expiresAt: minutesAgo(-intBetween(10, 120, rnd)),
      application: subscription.productName,
    }));

    const limits: LicenseLimit[] = [
      { name: 'Seats', key: 'SEATS', limit: String(seatLimit), used: String(seatsUsed), utilization: Math.round((seatsUsed / seatLimit) * 100) },
      { name: 'Activations', key: 'ACTIVATIONS', limit: String(activationLimit), used: String(activationCount), utilization: Math.round((activationCount / activationLimit) * 100) },
      { name: 'Concurrent sessions', key: 'CONCURRENT', limit: String(concurrentLimit), used: String(leases.length), utilization: Math.round((leases.length / concurrentLimit) * 100) },
      { name: 'Offline grace', key: 'OFFLINE_GRACE', limit: '14 days', used: '0 days', utilization: 0 },
    ];

    const history: LicenseHistoryEntry[] = [
      { id: `${id}-h1`, action: 'Licence issued', actor: 'Talha Hassan', timestamp: subscription.createdAt, detail: `Issued against ${subscription.reference}.` },
      { id: `${id}-h2`, action: 'Seats increased', actor: 'Sarah Ahmed', timestamp: daysAgo(intBetween(40, 180, rnd)), detail: `Seat limit raised to ${seatLimit}.` },
      { id: `${id}-h3`, action: 'Key rotated', actor: 'System', timestamp: daysAgo(intBetween(5, 40, rnd)), detail: 'Automatic annual key rotation completed.' },
    ];

    subscription.licenseIds = [id];

    return {
      id,
      reference: `LIC-${String(index + 4001)}`,
      maskedKey: maskedKey(index, rnd),
      tenantId: tenant.id,
      tenantName: tenant.name,
      organizationName: tenant.organizationName,
      productKey: subscription.productKey,
      productName: subscription.productName,
      subscriptionId: subscription.id,
      type,
      status,
      seatLimit,
      seatsUsed,
      activationLimit,
      activationCount,
      concurrentLimit,
      concurrentActive: leases.length,
      issuedAt: subscription.createdAt,
      expiresAt: subscription.periodEnd,
      poolId: null,
      seats,
      activations,
      leases,
      limits,
      history,
    } satisfies License;
  });
}

export const LICENSES: License[] = buildLicenses();

/* =========================================================
   Delegated licence pools
   ========================================================= */

interface PoolSeed {
  name: string;
  owner: string;
  ownerOrgKey: string;
  total: number;
  children?: PoolSeed[];
}

const POOL_HIERARCHY: PoolSeed[] = [
  {
    name: 'Centaiva Master Pool',
    owner: 'Centaiva',
    ownerOrgKey: 'CENTAIVA',
    total: 1000,
    children: [
      {
        name: 'Partner A Pool',
        owner: 'Partner A',
        ownerOrgKey: 'PARTNER-A',
        total: 400,
        children: [
          {
            name: 'Reseller A1 Pool',
            owner: 'Reseller A1',
            ownerOrgKey: 'RESELLER-A1',
            total: 150,
            children: [
              {
                name: 'Customer Delta Pool',
                owner: 'Customer Delta',
                ownerOrgKey: 'CUST-DELTA',
                total: 60,
                children: [
                  { name: 'Delta Field Services Pool', owner: 'Delta Field Services', ownerOrgKey: 'DELTA-FIELD', total: 24 },
                ],
              },
              { name: 'Customer Epsilon Pool', owner: 'Customer Epsilon', ownerOrgKey: 'CUST-EPSILON', total: 40 },
            ],
          },
          { name: 'Reseller A2 Pool', owner: 'Reseller A2', ownerOrgKey: 'RESELLER-A2', total: 90 },
        ],
      },
      {
        name: 'Partner B Pool',
        owner: 'Partner B',
        ownerOrgKey: 'PARTNER-B',
        total: 220,
        children: [
          { name: 'Customer Helix Pool', owner: 'Customer Helix Inc', ownerOrgKey: 'CUST-HELIX', total: 80 },
        ],
      },
      {
        name: 'WorkWell Direct Pool',
        owner: 'WorkWell',
        ownerOrgKey: 'WORKWELL',
        total: 260,
        children: [
          {
            name: 'Customer Alpha Pool',
            owner: 'Customer Alpha',
            ownerOrgKey: 'CUST-ALPHA',
            total: 120,
            children: [
              { name: 'Alpha Construction Pool', owner: 'Alpha Construction', ownerOrgKey: 'ALPHA-CONSTRUCTION', total: 70 },
            ],
          },
          { name: 'Customer Beta Pool', owner: 'Customer Beta', ownerOrgKey: 'CUST-BETA', total: 60 },
        ],
      },
    ],
  },
];

function buildPools(): LicensePool[] {
  const rnd = seeded(9753);
  const pools: LicensePool[] = [];

  const walk = (seed: PoolSeed, parentId: string | null, depth: number): void => {
    const id = `pool-${seed.ownerOrgKey.toLowerCase()}`;
    const children = seed.children ?? [];
    const allocatedToChildren = children.reduce((total, child) => total + child.total, 0);
    const directlyConsumed = children.length === 0 ? Math.round(seed.total * (0.4 + rnd() * 0.5)) : Math.round(seed.total * 0.1);
    const allocated = Math.min(seed.total, allocatedToChildren + directlyConsumed);

    pools.push({
      id,
      name: seed.name,
      ownerOrganizationId: `org-${seed.ownerOrgKey.toLowerCase()}`,
      ownerName: seed.owner,
      parentPoolId: parentId,
      productKey: 'WORKWELL_TIMESHEETS',
      productName: 'WorkWell Timesheets',
      totalSeats: seed.total,
      allocatedSeats: allocated,
      availableSeats: seed.total - allocated,
      childPoolCount: children.length,
      status: seed.ownerOrgKey === 'RESELLER-A2' ? 'Suspended' : seed.total - allocated === 0 ? 'Exhausted' : 'Active',
      createdAt: daysAgo(intBetween(60, 700, rnd)),
      depth,
    });

    for (const child of children) {
      walk(child, id, depth + 1);
    }
  };

  for (const root of POOL_HIERARCHY) {
    walk(root, null, 0);
  }

  return pools;
}

export const LICENSE_POOLS: LicensePool[] = buildPools();

/* Link a subset of licences to the delegated pools. */
LICENSES.forEach((license, index) => {
  const pool = LICENSE_POOLS.find((candidate) => candidate.ownerName === license.organizationName);
  if (pool) {
    license.poolId = pool.id;
  } else if (index % 6 === 0) {
    license.poolId = LICENSE_POOLS[0]!.id;
  }
});
