import { AuditEvent, AuditOutcome } from '../../models';
import { intBetween, minutesAgo, pick, seeded } from '../mock-utils';
import { APPLICATIONS, PRODUCTS } from './seed-catalog';
import { ORGANIZATIONS } from './seed-organizations';
import { TENANTS } from './seed-tenants';
import { USERS } from './seed-users';

interface EventShape {
  eventType: string;
  action: string;
  entityType: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

const EVENT_SHAPES: EventShape[] = [
  {
    eventType: 'Identity',
    action: 'user.created',
    entityType: 'User',
    before: null,
    after: { status: 'Invited', mfa: 'Pending', emailVerified: false, roles: ['Read Only'] },
  },
  {
    eventType: 'Identity',
    action: 'user.role.assigned',
    entityType: 'Role Assignment',
    before: { roles: ['Read Only'] },
    after: { roles: ['Read Only', 'Timesheet Reviewer'] },
  },
  {
    eventType: 'Identity',
    action: 'user.disabled',
    entityType: 'User',
    before: { status: 'Active', sessions: 2 },
    after: { status: 'Disabled', sessions: 0, reason: 'Left the organization' },
  },
  {
    eventType: 'Tenancy',
    action: 'tenant.created',
    entityType: 'Tenant',
    before: null,
    after: { status: 'Provisioning', region: 'UK South', environment: 'Production', dataStore: 'ctv-uk-south-production-sql-01' },
  },
  {
    eventType: 'Tenancy',
    action: 'organization.moved',
    entityType: 'Organization',
    before: { parent: 'WorkWell UK', path: 'Centaiva / WorkWell / WorkWell UK' },
    after: { parent: 'WorkWell EU', path: 'Centaiva / WorkWell / WorkWell EU' },
  },
  {
    eventType: 'Commercial',
    action: 'subscription.created',
    entityType: 'Subscription',
    before: null,
    after: { plan: 'Business', seats: 120, billingCycle: 'Annual', autoRenew: true },
  },
  {
    eventType: 'Commercial',
    action: 'subscription.seats.changed',
    entityType: 'Subscription',
    before: { seats: 80 },
    after: { seats: 120, proratedCharge: 'GBP 1,240.00' },
  },
  {
    eventType: 'Licensing',
    action: 'license.issued',
    entityType: 'License',
    before: null,
    after: { type: 'Named User', seatLimit: 120, status: 'Active', key: 'CNTA-****-****-9A4F' },
  },
  {
    eventType: 'Licensing',
    action: 'license.key.rotated',
    entityType: 'License',
    before: { key: 'CNTA-****-****-1C7B' },
    after: { key: 'CNTA-****-****-9A4F', rotatedReason: 'Scheduled annual rotation' },
  },
  {
    eventType: 'Licensing',
    action: 'license.seat.allocated',
    entityType: 'License Seat',
    before: { seatsUsed: 74 },
    after: { seatsUsed: 75, assignedTo: 'operative@customer.example' },
  },
  {
    eventType: 'Licensing',
    action: 'pool.seats.delegated',
    entityType: 'License Pool',
    before: { availableSeats: 210 },
    after: { availableSeats: 150, delegatedTo: 'Reseller A1 Pool', seats: 60 },
  },
  {
    eventType: 'Security',
    action: 'security.policy.updated',
    entityType: 'Authentication Policy',
    before: { requireMfa: false, sessionTimeoutMinutes: 480 },
    after: { requireMfa: true, sessionTimeoutMinutes: 120 },
  },
  {
    eventType: 'Security',
    action: 'identityprovider.configured',
    entityType: 'Identity Provider',
    before: null,
    after: { protocol: 'OpenID Connect', issuer: 'https://sso.customer.example', clientSecret: '••••••••' },
  },
  {
    eventType: 'Security',
    action: 'session.revoked',
    entityType: 'Session',
    before: { active: true },
    after: { active: false, revokedBy: 'Security Auditor' },
  },
  {
    eventType: 'Operations',
    action: 'provisioning.run.completed',
    entityType: 'Provisioning Run',
    before: { status: 'Running', step: 'Initialize Product' },
    after: { status: 'Completed', durationMs: 184_000, steps: 7 },
  },
  {
    eventType: 'Operations',
    action: 'provisioning.run.failed',
    entityType: 'Provisioning Run',
    before: { status: 'Running', step: 'Assign Data Store' },
    after: { status: 'Failed', error: 'Data store capacity threshold exceeded', retryable: true },
  },
  {
    eventType: 'Operations',
    action: 'deployment.released',
    entityType: 'Deployment',
    before: { version: '4.7.9' },
    after: { version: '4.8.2', strategy: 'Rolling', downtimeSeconds: 0 },
  },
  {
    eventType: 'Operations',
    action: 'integration.sync.failed',
    entityType: 'Tenant Integration',
    before: { status: 'Connected', lastSyncRecords: 4_210 },
    after: { status: 'Error', error: 'Upstream returned 401 unauthorized', nextRetry: 'in 15 minutes' },
  },
  {
    eventType: 'Catalog',
    action: 'featureflag.override.set',
    entityType: 'Feature Flag',
    before: { value: false, scope: 'Tenant' },
    after: { value: true, scope: 'Tenant', rolloutPercent: 35 },
  },
  {
    eventType: 'Catalog',
    action: 'plan.version.published',
    entityType: 'Plan Version',
    before: { status: 'Draft', version: '3.0' },
    after: { status: 'Published', version: '3.0', effectiveFrom: '2026-10-01' },
  },
];

function buildAuditEvents(): AuditEvent[] {
  const rnd = seeded(1919);

  return Array.from({ length: 180 }, (_, index) => {
    const shape = EVENT_SHAPES[index % EVENT_SHAPES.length]!;
    const actor = USERS[(index * 7) % USERS.length]!;
    const tenant = TENANTS[(index * 5) % TENANTS.length]!;
    const organization = ORGANIZATIONS.find((org) => org.id === tenant.organizationId)!;
    const product = PRODUCTS[(index * 3) % PRODUCTS.length]!;
    const application = APPLICATIONS.find((app) => app.productKey === product.key) ?? APPLICATIONS[0]!;

    const outcome: AuditOutcome =
      shape.action.endsWith('failed')
        ? 'Failure'
        : index % 23 === 4
          ? 'Denied'
          : index % 31 === 7
            ? 'Warning'
            : 'Success';

    return {
      id: `evt-${String(100_000 + index)}`,
      timestamp: minutesAgo(index * 17 + intBetween(1, 15, rnd)),
      actorName: index % 19 === 0 ? 'Provisioning Orchestrator' : actor.displayName,
      actorEmail: index % 19 === 0 ? 'svc-provisioning@centaiva.com' : actor.email,
      actorType: index % 19 === 0 ? 'Service Account' : index % 29 === 0 ? 'System' : 'User',
      eventType: shape.eventType,
      action: shape.action,
      entityType: shape.entityType,
      entityName:
        shape.entityType === 'Tenant'
          ? tenant.name
          : shape.entityType === 'Organization'
            ? organization.name
            : shape.entityType === 'User'
              ? USERS[(index * 11) % USERS.length]!.displayName
              : `${shape.entityType} ${1000 + index}`,
      entityId: `${shape.entityType.toLowerCase().replace(/\s+/g, '-')}-${1000 + index}`,
      organizationName: organization.name,
      organizationId: organization.id,
      tenantName: tenant.name,
      tenantId: tenant.id,
      productName: product.name,
      applicationName: application.name,
      outcome,
      correlationId: `crl-${String(index).padStart(4, '0')}-${'abcdef0123456789'[index % 16]}${'abcdef0123456789'[(index * 3) % 16]}f4-${String(7000 + index)}`,
      ipAddress: `51.${intBetween(10, 240, rnd)}.${intBetween(10, 240, rnd)}.${intBetween(2, 250, rnd)}`,
      userAgent: pick([
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/139.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) Chrome/141.0',
        'Centaiva.Provisioning/6.0.3 (+https://centaiva.com)',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2) Safari/18.0',
      ], rnd),
      before: shape.before,
      after:
        outcome === 'Failure' || outcome === 'Denied'
          ? { ...(shape.after ?? {}), outcome, error: outcome === 'Denied' ? 'Caller lacks the required permission' : 'Operation failed during execution' }
          : shape.after,
      metadata: {
        environment: tenant.environment,
        region: tenant.region,
        correlationSource: 'centaiva-admin',
        requestId: `req-${String(500_000 + index)}`,
        durationMs: intBetween(18, 3_400, rnd),
        apiVersion: '2026-05-01',
      },
    } satisfies AuditEvent;
  });
}

export const AUDIT_EVENTS: AuditEvent[] = buildAuditEvents();
