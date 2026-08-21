import {
  ActiveSession,
  AuthenticationPolicy,
  FeatureFlag,
  FlagOverride,
  IdentityProvider,
  Invitation,
  InvitationStatus,
  SecurityAlert,
  ServiceAccount,
  ServiceAccountCredential,
  VerifiedDomain,
} from '../../models';
import { daysAgo, daysAhead, intBetween, minutesAgo, pick, seeded } from '../mock-utils';
import { APPLICATIONS } from './seed-catalog';
import { ORGANIZATIONS } from './seed-organizations';
import { TENANTS } from './seed-tenants';
import { USERS } from './seed-users';

/* =========================================================
   Identity providers — every secret is masked, never real.
   ========================================================= */

export const IDENTITY_PROVIDERS: IdentityProvider[] = [
  {
    id: 'idp-entra-centaiva',
    name: 'Microsoft Entra ID',
    key: 'ENTRA_CENTAIVA',
    protocol: 'OpenID Connect',
    tenantName: 'Centaiva Platform Control',
    tenantId: 'tnt-ctv-control',
    domains: ['centaiva.com', 'centaiva.co.uk'],
    status: 'Enabled',
    issuer: 'https://login.microsoftonline.com/8f21c0a1-****-****-****-************/v2.0',
    clientId: '4c9f21ab-****-****-****-************',
    clientSecretMasked: '••••••••••••••••••••••••',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    userCount: 148,
    updatedAt: daysAgo(11),
    accent: '#0078d4',
    icon: 'pi pi-microsoft',
  },
  {
    id: 'idp-google-workwell',
    name: 'Google Workspace',
    key: 'GOOGLE_WORKWELL',
    protocol: 'OpenID Connect',
    tenantName: 'WorkWell UK Internal',
    tenantId: 'tnt-ww-uk-int',
    domains: ['workwell.io'],
    status: 'Enabled',
    issuer: 'https://accounts.google.com',
    clientId: '839201****-abcdefg.apps.googleusercontent.com',
    clientSecretMasked: '••••••••••••••••••••',
    scopes: ['openid', 'profile', 'email'],
    userCount: 92,
    updatedAt: daysAgo(26),
    accent: '#ea4335',
    icon: 'pi pi-google',
  },
  {
    id: 'idp-oidc-alpha',
    name: 'Generic OpenID Connect',
    key: 'OIDC_ALPHA',
    protocol: 'OpenID Connect',
    tenantName: 'Alpha Group Production',
    tenantId: 'tnt-alpha-prod',
    domains: ['alpha-group.co.uk'],
    status: 'Enabled',
    issuer: 'https://sso.alpha-group.co.uk/realms/alpha',
    clientId: 'centaiva-platform',
    clientSecretMasked: '••••••••••••••••',
    scopes: ['openid', 'profile', 'email', 'groups'],
    userCount: 214,
    updatedAt: daysAgo(4),
    accent: '#7c3aed',
    icon: 'pi pi-key',
  },
  {
    id: 'idp-saml-northside',
    name: 'SAML Enterprise',
    key: 'SAML_NORTHSIDE',
    protocol: 'SAML 2.0',
    tenantName: 'Northside Trust Clinical',
    tenantId: 'tnt-northside-clin',
    domains: ['northsidetrust.nhs.uk'],
    status: 'Pending',
    issuer: 'https://sts.northsidetrust.nhs.uk/adfs/services/trust',
    clientId: 'urn:centaiva:medpure',
    clientSecretMasked: 'Certificate • thumbprint ••••••••9F2A',
    scopes: ['NameID', 'EmailAddress', 'Group'],
    userCount: 0,
    updatedAt: daysAgo(1),
    accent: '#0891b2',
    icon: 'pi pi-shield',
  },
  {
    id: 'idp-entra-helix',
    name: 'Microsoft Entra ID',
    key: 'ENTRA_HELIX',
    protocol: 'OpenID Connect',
    tenantName: 'Helix Inc Production',
    tenantId: 'tnt-helix-prod',
    domains: ['helix.com'],
    status: 'Error',
    issuer: 'https://login.microsoftonline.com/1b7d33ef-****-****-****-************/v2.0',
    clientId: '7ae1092c-****-****-****-************',
    clientSecretMasked: '••••••••••••••••••••••••',
    scopes: ['openid', 'profile', 'email'],
    userCount: 37,
    updatedAt: daysAgo(2),
    accent: '#0078d4',
    icon: 'pi pi-microsoft',
  },
  {
    id: 'idp-oidc-nordkraft',
    name: 'Generic OpenID Connect',
    key: 'OIDC_NORDKRAFT',
    protocol: 'OpenID Connect',
    tenantName: 'Nordkraft Production',
    tenantId: 'tnt-nordkraft-prod',
    domains: ['nordkraft.eu'],
    status: 'Disabled',
    issuer: 'https://id.nordkraft.eu/oauth2',
    clientId: 'centaiva-eu',
    clientSecretMasked: '••••••••••••••••',
    scopes: ['openid', 'email'],
    userCount: 61,
    updatedAt: daysAgo(58),
    accent: '#34a853',
    icon: 'pi pi-key',
  },
];

/* =========================================================
   Service accounts — masked credentials only.
   ========================================================= */

function buildServiceAccounts(): ServiceAccount[] {
  const rnd = seeded(7788);

  const seeds: { name: string; appKey: string; tenantKey: string | null; description: string; scopes: string[] }[] = [
    { name: 'Xero Ledger Connector', appKey: 'WW_FIN_API', tenantKey: 'ALPHA-PROD', description: 'Synchronises invoices and ledger entries with Xero.', scopes: ['API.LEDGER.SYNC', 'INVOICE.VIEW'] },
    { name: 'Evertime Clock Feed', appKey: 'WW_TS_API', tenantKey: 'ALPHA-CONS', description: 'Ingests clock-in events from site devices.', scopes: ['API.TIMESHEET.WRITE', 'API.TIMESHEET.READ'] },
    { name: 'Payroll Export Agent', appKey: 'WW_TS_API', tenantKey: 'BETA-PROD', description: 'Runs the nightly approved period export to payroll.', scopes: ['PAYROLL.EXPORT', 'API.TIMESHEET.READ'] },
    { name: 'Platform Audit Exporter', appKey: 'CTV_ADMIN', tenantKey: null, description: 'Streams audit events into the customer SIEM.', scopes: ['AUDIT.VIEW', 'AUDIT.EXPORT'] },
    { name: 'Provisioning Orchestrator', appKey: 'CTV_ADMIN', tenantKey: null, description: 'Executes tenant provisioning templates.', scopes: ['PROVISIONING.RUN', 'TENANT.CREATE'] },
    { name: 'AI Extraction Worker', appKey: 'CTV_AI_SERVICE', tenantKey: 'MEDPURE-PHARM', description: 'Processes queued extraction jobs for the pharmacy network.', scopes: ['AI.EXTRACT.RUN'] },
    { name: 'Identity Directory Sync', appKey: 'CTV_IDENTITY_API', tenantKey: 'CTV-STAFF', description: 'Reconciles the directory with Microsoft Entra ID.', scopes: ['USER.VIEW', 'USER.UPDATE'] },
    { name: 'MedPure Compliance Reporter', appKey: 'MEDPURE_PORTAL', tenantKey: 'NORTHSIDE-CLIN', description: 'Generates weekly clinical compliance extracts.', scopes: ['CLINICAL.AUDIT.VIEW', 'REPORT.VIEW'] },
    { name: 'Legacy Reporting Bridge', appKey: 'WW_FIN_API', tenantKey: 'HELIX-PROD', description: 'Deprecated bridge kept for historical reporting only.', scopes: ['INVOICE.VIEW'] },
  ];

  return seeds.map((seed, index) => {
    const application = APPLICATIONS.find((app) => app.key === seed.appKey)!;
    const tenant = seed.tenantKey ? TENANTS.find((t) => t.key === seed.tenantKey) : undefined;

    const credentials: ServiceAccountCredential[] = [
      {
        id: `cred-${index + 1}-primary`,
        name: 'Primary secret',
        type: 'Client Secret',
        maskedValue: `ctv_sk_••••••••••••••••${String(1000 + index)}`,
        createdAt: daysAgo(intBetween(60, 400, rnd)),
        expiresAt: daysAhead(intBetween(-20, 300, rnd)),
        status: index === 8 ? 'Expired' : index % 4 === 1 ? 'Expiring' : 'Active',
      },
      {
        id: `cred-${index + 1}-rotation`,
        name: 'Rotation secret',
        type: index % 3 === 0 ? 'Certificate' : 'Client Secret',
        maskedValue: index % 3 === 0 ? 'thumbprint ••••••••••••7C1D' : `ctv_sk_••••••••••••••••${String(2000 + index)}`,
        createdAt: daysAgo(intBetween(5, 60, rnd)),
        expiresAt: daysAhead(intBetween(120, 700, rnd)),
        status: 'Active',
      },
    ];

    return {
      id: `svc-${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: seed.name,
      clientId: `ctv-svc-${String(index + 1).padStart(3, '0')}-${'abcdef0123456789'[index % 16]}****`,
      applicationName: application.name,
      applicationKey: application.key,
      tenantName: tenant?.name ?? 'Platform wide',
      tenantId: tenant?.id ?? null,
      description: seed.description,
      status: index === 8 ? 'Expired' : index === 5 ? 'Disabled' : 'Active',
      lastUsedAt: minutesAgo(intBetween(3, 12_000, rnd)),
      createdAt: daysAgo(intBetween(80, 700, rnd)),
      scopes: seed.scopes,
      credentials,
    } satisfies ServiceAccount;
  });
}

export const SERVICE_ACCOUNTS: ServiceAccount[] = buildServiceAccounts();

/* =========================================================
   Feature flags
   ========================================================= */

function buildFlags(): FeatureFlag[] {
  const rnd = seeded(9911);

  const seeds: { name: string; key: string; appKey: string; description: string; defaultValue: boolean; rollout: number; status: FeatureFlag['status'] }[] = [
    { name: 'AI Extraction', key: 'AI_EXTRACTION', appKey: 'CTV_AI_SERVICE', description: 'Routes uploaded documents through the AI extraction pipeline.', defaultValue: false, rollout: 35, status: 'Active' },
    { name: 'New Dashboard', key: 'NEW_DASHBOARD', appKey: 'CTV_ADMIN', description: 'Replaces the legacy overview with the redesigned control plane dashboard.', defaultValue: true, rollout: 100, status: 'Active' },
    { name: 'Advanced Reporting', key: 'ADVANCED_REPORTING', appKey: 'WW_TS_WEB', description: 'Enables the cross-site custom report builder.', defaultValue: false, rollout: 60, status: 'Active' },
    { name: 'Beta Features', key: 'BETA_FEATURES', appKey: 'CTV_ADMIN', description: 'Master switch exposing preview functionality to opted-in tenants.', defaultValue: false, rollout: 12, status: 'Active' },
    { name: 'Multi Tenant Routing', key: 'MULTI_TENANT_ROUTING', appKey: 'CTV_ADMIN', description: 'Uses the new deployment resolver for tenant data routing.', defaultValue: true, rollout: 85, status: 'Active' },
    { name: 'Offline Timesheet Capture', key: 'OFFLINE_CAPTURE', appKey: 'WW_TS_WEB', description: 'Allows operatives to record time without connectivity.', defaultValue: false, rollout: 22, status: 'Draft' },
    { name: 'Ledger Auto Match', key: 'LEDGER_AUTO_MATCH', appKey: 'WW_FIN_API', description: 'Automatically matches ledger entries during Xero sync.', defaultValue: false, rollout: 40, status: 'Active' },
    { name: 'Legacy Export Format', key: 'LEGACY_EXPORT', appKey: 'WW_TS_API', description: 'Retains the pre-4.0 payroll export layout.', defaultValue: false, rollout: 5, status: 'Archived' },
  ];

  return seeds.map((seed, index) => {
    const application = APPLICATIONS.find((app) => app.key === seed.appKey)!;

    const overrides: FlagOverride[] = [
      { id: `ovr-${index}-org`, scopeType: 'Organization', scopeName: ORGANIZATIONS[3]!.name, value: true, updatedAt: daysAgo(intBetween(1, 40, rnd)), updatedBy: 'Sarah Ahmed' },
      { id: `ovr-${index}-org2`, scopeType: 'Organization', scopeName: ORGANIZATIONS[9]!.name, value: false, updatedAt: daysAgo(intBetween(1, 60, rnd)), updatedBy: 'Talha Hassan' },
      { id: `ovr-${index}-tenant`, scopeType: 'Tenant', scopeName: TENANTS[index % TENANTS.length]!.name, value: true, updatedAt: daysAgo(intBetween(1, 30, rnd)), updatedBy: 'Talha Hassan' },
      { id: `ovr-${index}-tenant2`, scopeType: 'Tenant', scopeName: TENANTS[(index + 4) % TENANTS.length]!.name, value: false, updatedAt: daysAgo(intBetween(1, 30, rnd)), updatedBy: 'System' },
      { id: `ovr-${index}-user`, scopeType: 'User', scopeName: USERS[index % USERS.length]!.displayName, value: true, updatedAt: daysAgo(intBetween(1, 20, rnd)), updatedBy: 'Talha Hassan' },
      { id: `ovr-${index}-env`, scopeType: 'Environment', scopeName: 'Staging', value: true, updatedAt: daysAgo(intBetween(1, 15, rnd)), updatedBy: 'Elliot Frost' },
      { id: `ovr-${index}-env2`, scopeType: 'Environment', scopeName: 'Development', value: true, updatedAt: daysAgo(intBetween(1, 15, rnd)), updatedBy: 'Elliot Frost' },
    ];

    return {
      id: `flg-${seed.key.toLowerCase().replace(/_/g, '-')}`,
      name: seed.name,
      key: seed.key,
      applicationName: application.name,
      applicationKey: application.key,
      productName: application.productName,
      description: seed.description,
      defaultValue: seed.defaultValue,
      status: seed.status,
      rolloutPercent: seed.rollout,
      updatedAt: daysAgo(intBetween(1, 40, rnd)),
      overrides,
    } satisfies FeatureFlag;
  });
}

export const FEATURE_FLAGS: FeatureFlag[] = buildFlags();

/* =========================================================
   Posture, policies, domains, sessions
   ========================================================= */

export const SECURITY_ALERTS: SecurityAlert[] = [
  { id: 'alr-1', title: 'Identity provider handshake failing', detail: 'Entra ID federation for Helix Inc has returned invalid_client on 42 attempts in the last hour.', severity: 'High', raisedAt: minutesAgo(38), tenantName: 'Helix Inc Production', status: 'Open' },
  { id: 'alr-2', title: 'Service account credential expired', detail: 'Legacy Reporting Bridge is using an expired client secret and can no longer authenticate.', severity: 'Medium', raisedAt: minutesAgo(210), tenantName: 'Helix Inc Production', status: 'Acknowledged' },
  { id: 'alr-3', title: 'MFA not enforced on a production tenant', detail: 'Beta Retail Production allows password-only sign in for 18 active users.', severity: 'Medium', raisedAt: minutesAgo(640), tenantName: 'Beta Retail Production', status: 'Open' },
  { id: 'alr-4', title: 'Unusual sign-in location', detail: 'A platform owner session was established from a previously unseen region.', severity: 'Low', raisedAt: minutesAgo(1_420), tenantName: 'Centaiva Platform Control', status: 'Resolved' },
  { id: 'alr-5', title: 'Repeated failed sign-in attempts', detail: '27 consecutive failures recorded against a suspended reseller account.', severity: 'Low', raisedAt: minutesAgo(2_900), tenantName: 'Reseller A2 Demo', status: 'Acknowledged' },
];

export const AUTHENTICATION_POLICIES: AuthenticationPolicy[] = TENANTS.map((tenant, index) => ({
  id: `pol-${tenant.id}`,
  tenantId: tenant.id,
  tenantName: tenant.name,
  requireMfa: tenant.securityPolicy.requireMfa,
  allowPasswordLogin: tenant.securityPolicy.allowPasswordLogin,
  allowExternalIdentityProviders: tenant.securityPolicy.allowExternalIdentityProviders,
  sessionTimeoutMinutes: tenant.securityPolicy.sessionTimeoutMinutes,
  maxFailedAttempts: tenant.securityPolicy.maxFailedAttempts,
  minimumPasswordLength: tenant.securityPolicy.minimumPasswordLength,
  requireVerifiedEmail: tenant.securityPolicy.requireVerifiedEmail,
  updatedAt: daysAgo(index * 3 + 2),
}));

export const VERIFIED_DOMAINS: VerifiedDomain[] = [
  { id: 'dom-1', domain: 'centaiva.com', tenantName: 'Centaiva Platform Control', verified: true, verificationMethod: 'DNS TXT', identityProvider: 'Microsoft Entra ID', addedAt: daysAgo(720) },
  { id: 'dom-2', domain: 'workwell.io', tenantName: 'WorkWell UK Internal', verified: true, verificationMethod: 'DNS TXT', identityProvider: 'Google Workspace', addedAt: daysAgo(610) },
  { id: 'dom-3', domain: 'alpha-group.co.uk', tenantName: 'Alpha Group Production', verified: true, verificationMethod: 'DNS TXT', identityProvider: 'Generic OpenID Connect', addedAt: daysAgo(388) },
  { id: 'dom-4', domain: 'betaretail.co.uk', tenantName: 'Beta Retail Production', verified: false, verificationMethod: 'HTML File', identityProvider: '—', addedAt: daysAgo(21) },
  { id: 'dom-5', domain: 'northsidetrust.nhs.uk', tenantName: 'Northside Trust Clinical', verified: false, verificationMethod: 'DNS TXT', identityProvider: 'SAML Enterprise', addedAt: daysAgo(6) },
  { id: 'dom-6', domain: 'nordkraft.eu', tenantName: 'Nordkraft Production', verified: true, verificationMethod: 'DNS TXT', identityProvider: 'Generic OpenID Connect', addedAt: daysAgo(240) },
  { id: 'dom-7', domain: 'helix.com', tenantName: 'Helix Inc Production', verified: true, verificationMethod: 'Email', identityProvider: 'Microsoft Entra ID', addedAt: daysAgo(150) },
];

function buildSessions(): ActiveSession[] {
  const rnd = seeded(4433);

  return Array.from({ length: 24 }, (_, index) => {
    const user = USERS[(index * 2) % USERS.length]!;
    const tenant = TENANTS[index % TENANTS.length]!;

    return {
      id: `ses-${index + 1}`,
      userName: user.displayName,
      email: user.email,
      tenantName: tenant.name,
      ipAddress: `51.${intBetween(10, 240, rnd)}.${intBetween(10, 240, rnd)}.${intBetween(2, 250, rnd)}`,
      location: pick(['London, UK', 'Manchester, UK', 'Cardiff, UK', 'Amsterdam, NL', 'Copenhagen, DK', 'New York, US'], rnd),
      device: pick(['Windows 11 · Edge', 'macOS · Chrome', 'iOS · Safari', 'Android · Chrome', 'Windows 11 · Chrome'], rnd),
      environment: tenant.environment,
      startedAt: minutesAgo(intBetween(15, 900, rnd)),
      lastActiveAt: minutesAgo(intBetween(1, 45, rnd)),
      mfaSatisfied: index % 6 !== 0,
    } satisfies ActiveSession;
  });
}

export const ACTIVE_SESSIONS: ActiveSession[] = buildSessions();

/* =========================================================
   Invitations
   ========================================================= */

function buildInvitations(): Invitation[] {
  const rnd = seeded(2211);
  const statuses: InvitationStatus[] = ['Pending', 'Accepted', 'Expired', 'Revoked'];
  const roles = ['Tenant Admin', 'Timesheet Reviewer', 'Finance Admin', 'Read Only', 'Organization Admin', 'Timesheet Admin'];
  const firstNames = ['Grace', 'Adam', 'Sana', 'Liam', 'Petra', 'Tomas', 'Elena', 'Karl', 'Yusuf', 'Nina', 'Beth', 'Cara', 'Dominic', 'Ella', 'Fraser', 'Gita', 'Harvey', 'Ines'];
  const lastNames = ['Palmer', 'Okafor', 'Bright', 'Novak', 'Salomon', 'Vega', 'Cross', 'Duarte', 'Hale', 'Sorensen', 'Ward', 'Byrne'];

  return Array.from({ length: 26 }, (_, index) => {
    const tenant = TENANTS[(index * 3) % TENANTS.length]!;
    const organization = ORGANIZATIONS.find((org) => org.id === tenant.organizationId)!;
    const first = firstNames[index % firstNames.length]!;
    const last = lastNames[(index * 5) % lastNames.length]!;
    const status = index < 9 ? 'Pending' : statuses[index % statuses.length]!;
    const sentDaysAgo = intBetween(1, 40, rnd);

    return {
      id: `inv-${index + 1}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${organization.slug}.com`,
      organizationName: organization.name,
      organizationId: organization.id,
      tenantName: tenant.name,
      tenantId: tenant.id,
      role: roles[index % roles.length]!,
      status,
      sentAt: daysAgo(sentDaysAgo),
      expiresAt: status === 'Expired' ? daysAgo(intBetween(1, 10, rnd)) : daysAhead(14 - Math.min(sentDaysAgo, 13)),
      invitedBy: pick(['Talha Hassan', 'Sarah Ahmed', 'John Smith', 'Emily Carter'], rnd),
      message: 'You have been invited to join the Centaiva Platform. This invitation expires 14 days after it was sent.',
    } satisfies Invitation;
  });
}

export const INVITATIONS: Invitation[] = buildInvitations();
