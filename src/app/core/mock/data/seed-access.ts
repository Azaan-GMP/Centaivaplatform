import { Role, RoleAssignment, RolePermissionGrant, RoleScope } from '../../models';
import { daysAgo, intBetween, pick, seeded } from '../mock-utils';
import { APPLICATIONS, PERMISSIONS } from './seed-catalog';
import { USERS } from './seed-users';

interface RoleSeed {
  name: string;
  key: string;
  scope: RoleScope;
  applicationKey: string | null;
  description: string;
  system: boolean;
  grants: string[];
}

const ROLE_SEEDS: RoleSeed[] = [
  {
    name: 'Platform Owner',
    key: 'PLATFORM_OWNER',
    scope: 'Platform',
    applicationKey: 'CTV_ADMIN',
    description: 'Unrestricted control plane access including tenancy, licensing and security administration.',
    system: true,
    grants: PERMISSIONS.map((permission) => permission.key),
  },
  {
    name: 'Organization Admin',
    key: 'ORGANIZATION_ADMIN',
    scope: 'Organization',
    applicationKey: 'CTV_ADMIN',
    description: 'Manages an organization sub-tree, its tenants, members and delegated licence pools.',
    system: true,
    grants: [
      'ORGANIZATION.CREATE', 'ORGANIZATION.MOVE', 'TENANT.CREATE', 'TENANT.UPDATE', 'TENANT.VIEW',
      'USER.CREATE', 'USER.UPDATE', 'USER.VIEW', 'SUBSCRIPTION.VIEW', 'LICENSE.VIEW', 'REPORT.VIEW', 'AUDIT.VIEW',
    ],
  },
  {
    name: 'Tenant Admin',
    key: 'TENANT_ADMIN',
    scope: 'Tenant',
    applicationKey: 'CTV_ADMIN',
    description: 'Administers a single tenant: members, product access, integrations and security policy.',
    system: true,
    grants: [
      'TENANT.UPDATE', 'TENANT.VIEW', 'USER.CREATE', 'USER.UPDATE', 'USER.VIEW', 'USER.DISABLE',
      'SUBSCRIPTION.VIEW', 'LICENSE.VIEW', 'REPORT.VIEW', 'SHIFT.VIEW',
    ],
  },
  {
    name: 'Finance Admin',
    key: 'FINANCE_ADMIN',
    scope: 'Tenant',
    applicationKey: 'WW_FIN_WEB',
    description: 'Full access to invoicing, budgets and multi-entity consolidation.',
    system: false,
    grants: [
      'INVOICE.VIEW', 'INVOICE.CREATE', 'INVOICE.APPROVE', 'CREDIT_NOTE.CREATE',
      'BUDGET.VIEW', 'BUDGET.EDIT', 'ENTITY.CONSOLIDATE', 'REPORT.VIEW', 'REPORT.EXPORT', 'SUBSCRIPTION.VIEW',
    ],
  },
  {
    name: 'Timesheet Admin',
    key: 'TIMESHEET_ADMIN',
    scope: 'Application',
    applicationKey: 'WW_TS_WEB',
    description: 'Configures timesheet processing, rotas and bulk approval for a tenant.',
    system: false,
    grants: [
      'TIMESHEET.CREATE', 'TIMESHEET.SUBMIT', 'TIMESHEET.REVIEW', 'TIMESHEET.APPROVE', 'TIMESHEET.REJECT',
      'TIMESHEET.BULK_APPROVE', 'SHIFT.VIEW', 'SHIFT.PUBLISH', 'ABSENCE.APPROVE', 'REPORT.VIEW', 'REPORT.EXPORT',
    ],
  },
  {
    name: 'Timesheet Reviewer',
    key: 'TIMESHEET_REVIEWER',
    scope: 'Application',
    applicationKey: 'WW_TS_WEB',
    description: 'Reviews and approves submitted timesheets without configuration rights.',
    system: false,
    grants: ['TIMESHEET.REVIEW', 'TIMESHEET.APPROVE', 'TIMESHEET.REJECT', 'SHIFT.VIEW', 'REPORT.VIEW'],
  },
  {
    name: 'Read Only',
    key: 'READ_ONLY',
    scope: 'Tenant',
    applicationKey: null,
    description: 'View-only access across the products a user is entitled to.',
    system: true,
    grants: ['TENANT.VIEW', 'USER.VIEW', 'SUBSCRIPTION.VIEW', 'LICENSE.VIEW', 'REPORT.VIEW', 'INVOICE.VIEW', 'SHIFT.VIEW'],
  },
  {
    name: 'Clinical Compliance Officer',
    key: 'CLINICAL_COMPLIANCE',
    scope: 'Application',
    applicationKey: 'MEDPURE_PORTAL',
    description: 'Signs clinical audit records and maintains the controlled drug register.',
    system: false,
    grants: ['CLINICAL.AUDIT.VIEW', 'CLINICAL.AUDIT.SIGN', 'CD.REGISTER.VIEW', 'CD.REGISTER.WRITE', 'REPORT.VIEW'],
  },
  {
    name: 'Integration Service Role',
    key: 'INTEGRATION_SERVICE',
    scope: 'Application',
    applicationKey: 'WW_FIN_API',
    description: 'Machine-to-machine role used by accounting connectors.',
    system: false,
    grants: ['API.LEDGER.SYNC', 'INVOICE.VIEW', 'API.TIMESHEET.READ'],
  },
  {
    name: 'Security Auditor',
    key: 'SECURITY_AUDITOR',
    scope: 'Platform',
    applicationKey: 'CTV_ADMIN',
    description: 'Read-only access to audit history, sessions and security posture.',
    system: false,
    grants: ['AUDIT.VIEW', 'AUDIT.EXPORT', 'SESSION.REVOKE', 'USER.VIEW', 'TENANT.VIEW'],
  },
];

function buildAssignments(seed: RoleSeed, rnd: () => number): RoleAssignment[] {
  const matching = USERS.filter((user) => user.primaryRole === seed.name);
  const sample = matching.length > 0 ? matching : USERS.slice(0, 3);

  return sample.slice(0, 8).map((user, index) => ({
    id: `asg-${seed.key.toLowerCase()}-${index + 1}`,
    principalName: user.displayName,
    principalEmail: user.email,
    principalType: seed.key === 'INTEGRATION_SERVICE' ? 'Service Account' : 'User',
    scopeName: user.organizations[0]?.name ?? 'Centaiva',
    scopeType: seed.scope,
    assignedAt: daysAgo(intBetween(10, 500, rnd)),
    assignedBy: pick(['Talha Hassan', 'Sarah Ahmed', 'System'], rnd),
  }));
}

function buildRoles(): Role[] {
  const rnd = seeded(5150);

  return ROLE_SEEDS.map((seed) => {
    const application = seed.applicationKey ? APPLICATIONS.find((app) => app.key === seed.applicationKey) : undefined;
    const granted = new Set(seed.grants);

    const scopedPermissions = seed.applicationKey && seed.key !== 'PLATFORM_OWNER'
      ? PERMISSIONS.filter((permission) => permission.applicationId === application?.id || granted.has(permission.key))
      : PERMISSIONS;

    const permissions: RolePermissionGrant[] = scopedPermissions.map((permission) => {
      const owningApp = APPLICATIONS.find((app) => app.id === permission.applicationId);
      const owningModule = owningApp?.modules.find((module) => module.id === permission.moduleId);
      const owningFeature = owningModule?.features.find((feature) => feature.id === permission.featureId);
      return {
        permissionKey: permission.key,
        permissionName: permission.name,
        module: owningModule?.name ?? '—',
        feature: owningFeature?.name ?? '—',
        granted: granted.has(permission.key),
      };
    });

    const assignments = buildAssignments(seed, rnd);

    return {
      id: `role-${seed.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: seed.name,
      key: seed.key,
      description: seed.description,
      scope: seed.scope,
      applicationName: application?.name ?? 'All applications',
      applicationKey: seed.applicationKey,
      productKey: application?.productKey ?? null,
      system: seed.system,
      status: seed.key === 'INTEGRATION_SERVICE' ? 'Draft' : 'Active',
      permissionCount: seed.grants.length,
      assignmentCount: assignments.length + intBetween(0, 40, rnd),
      createdAt: daysAgo(intBetween(200, 900, rnd)),
      updatedAt: daysAgo(intBetween(1, 90, rnd)),
      permissions,
      assignments,
    } satisfies Role;
  });
}

export const ROLES: Role[] = buildRoles();
