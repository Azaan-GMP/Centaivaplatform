import { MfaStatus, PlatformUser, UserStatus } from '../../models';
import { daysAgo, intBetween, minutesAgo, pick, seeded } from '../mock-utils';
import { ORGANIZATIONS } from './seed-organizations';
import { TENANTS } from './seed-tenants';

const AVATAR_COLORS = ['#1a73e8', '#34a853', '#7c3aed', '#0891b2', '#f59e0b', '#dc2626', '#0f766e', '#be185d'];

interface UserSeed {
  first: string;
  last: string;
  email: string;
  title: string;
  role: string;
  status: UserStatus;
  mfa: MfaStatus;
  orgKeys: string[];
  tenantKeys: string[];
  products: string[];
}

const HEADLINE_USERS: UserSeed[] = [
  {
    first: 'Talha', last: 'Hassan', email: 'talha.hassan@centaiva.com',
    title: 'Platform Owner', role: 'Platform Owner', status: 'Active', mfa: 'Enforced',
    orgKeys: ['CENTAIVA', 'CENTAIVA-INTERNAL'], tenantKeys: ['CTV-CONTROL', 'CTV-STAFF', 'CTV-ID-QA'],
    products: ['CENTAIVA_PLATFORM', 'CENTAIVA_IDENTITY', 'CENTAIVA_AI'],
  },
  {
    first: 'Sarah', last: 'Ahmed', email: 'sarah.ahmed@workwell.io',
    title: 'Organization Admin', role: 'Organization Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['WORKWELL', 'WORKWELL-UK', 'WORKWELL-EU'], tenantKeys: ['WW-UK-INT', 'WW-EU-INT'],
    products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'],
  },
  {
    first: 'John', last: 'Smith', email: 'john.smith@workwell.io',
    title: 'Tenant Admin', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['WORKWELL-UK'], tenantKeys: ['WW-UK-INT', 'ALPHA-PROD', 'BETA-PROD'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Emily', last: 'Carter', email: 'emily.carter@alpha-group.co.uk',
    title: 'Finance Admin', role: 'Finance Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CUST-ALPHA', 'ALPHA-FACILITIES'], tenantKeys: ['ALPHA-PROD', 'ALPHA-FAC'],
    products: ['WORKWELL_FINANCE', 'WORKWELL_TIMESHEETS'],
  },
  {
    first: 'David', last: 'Wilson', email: 'david.wilson@betaretail.co.uk',
    title: 'Read Only', role: 'Read Only', status: 'Active', mfa: 'Disabled',
    orgKeys: ['CUST-BETA'], tenantKeys: ['BETA-PROD', 'BETA-NORTH'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Nadia', last: 'Farouk', email: 'nadia.farouk@centaiva.com',
    title: 'Partner Operations Lead', role: 'Organization Admin', status: 'Active', mfa: 'Enforced',
    orgKeys: ['PARTNER-NETWORK', 'CENTAIVA'], tenantKeys: ['PARTNER-A-SBX', 'CTV-AI-PREVIEW'],
    products: ['CENTAIVA_PLATFORM', 'CENTAIVA_AI'],
  },
  {
    first: 'Aisha', last: 'Rahman', email: 'aisha.rahman@medpure.health',
    title: 'Clinical Director', role: 'Organization Admin', status: 'Active', mfa: 'Enforced',
    orgKeys: ['MEDPURE', 'MEDPURE-CLINICAL'], tenantKeys: ['NORTHSIDE-CLIN', 'MEDPURE-SBX'],
    products: ['MEDPURE'],
  },
  {
    first: 'Ian', last: 'McAllister', email: 'ian.mcallister@partnera.com',
    title: 'Partner Principal', role: 'Organization Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['PARTNER-A'], tenantKeys: ['PARTNER-A-SBX'],
    products: ['WORKWELL_TIMESHEETS', 'CENTAIVA_AI'],
  },
  {
    first: 'Chloe', last: 'Bennett', email: 'chloe.bennett@resellera1.com',
    title: 'Reseller Manager', role: 'Organization Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['RESELLER-A1'], tenantKeys: ['RESELLER-A1-DEMO'],
    products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'],
  },
  {
    first: 'Marta', last: 'Kowalski', email: 'marta.kowalski@resellera2.eu',
    title: 'Reseller Manager', role: 'Tenant Admin', status: 'Suspended', mfa: 'Disabled',
    orgKeys: ['RESELLER-A2'], tenantKeys: ['RESELLER-A2-DEMO'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Marcus', last: 'Lee', email: 'marcus.lee@gammalogistics.co.uk',
    title: 'Operations Manager', role: 'Tenant Admin', status: 'Invited', mfa: 'Pending',
    orgKeys: ['CUST-GAMMA'], tenantKeys: ['GAMMA-TRIAL'],
    products: ['WORKWELL_FINANCE'],
  },
  {
    first: 'Priya', last: 'Nair', email: 'priya.nair@alpha-group.co.uk',
    title: 'Site Manager', role: 'Timesheet Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['ALPHA-SITE-MAN'], tenantKeys: ['ALPHA-MAN'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Owen', last: 'Bradley', email: 'owen.bradley@alpha-group.co.uk',
    title: 'Site Manager', role: 'Timesheet Reviewer', status: 'Active', mfa: 'Disabled',
    orgKeys: ['ALPHA-SITE-LDS'], tenantKeys: ['ALPHA-LDS'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Grace', last: 'Kelly', email: 'grace.kelly@alpha-group.co.uk',
    title: 'Facilities Lead', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['ALPHA-FACILITIES'], tenantKeys: ['ALPHA-FAC'],
    products: ['WORKWELL_TIMESHEETS', 'WORKWELL_FINANCE'],
  },
  {
    first: 'Daniel', last: 'Reid', email: 'daniel.reid@alpha-group.co.uk',
    title: 'Construction Director', role: 'Organization Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['ALPHA-CONSTRUCTION'], tenantKeys: ['ALPHA-CONS'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Lars', last: 'Pedersen', email: 'lars.pedersen@nordkraft.eu',
    title: 'IT Manager', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CUST-NORDKRAFT'], tenantKeys: ['NORDKRAFT-PROD'],
    products: ['WORKWELL_TIMESHEETS', 'CENTAIVA_AI'],
  },
  {
    first: 'Anneke', last: 'de Vries', email: 'anneke.devries@vantage.nl',
    title: 'Financial Controller', role: 'Finance Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CUST-VANTAGE'], tenantKeys: ['VANTAGE-PROD'],
    products: ['WORKWELL_FINANCE'],
  },
  {
    first: 'Fiona', last: 'Grant', email: 'fiona.grant@northsidetrust.nhs.uk',
    title: 'Compliance Officer', role: 'Tenant Admin', status: 'Active', mfa: 'Enforced',
    orgKeys: ['NORTHSIDE-TRUST'], tenantKeys: ['NORTHSIDE-CLIN'],
    products: ['MEDPURE'],
  },
  {
    first: 'Ryan', last: 'Foster', email: 'ryan.foster@deltaworks.co.uk',
    title: 'Operations Director', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CUST-DELTA'], tenantKeys: ['DELTA-PROD'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Megan', last: 'Doyle', email: 'megan.doyle@deltaworks.co.uk',
    title: 'Field Supervisor', role: 'Timesheet Reviewer', status: 'Active', mfa: 'Disabled',
    orgKeys: ['DELTA-FIELD'], tenantKeys: ['DELTA-FIELD'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Peter', last: 'Nash', email: 'peter.nash@epsilonhold.co.uk',
    title: 'Innovation Lead', role: 'Read Only', status: 'Invited', mfa: 'Pending',
    orgKeys: ['CUST-EPSILON'], tenantKeys: ['EPSILON-PILOT'],
    products: ['CENTAIVA_AI'],
  },
  {
    first: 'Alicia', last: 'Moreno', email: 'alicia.moreno@helix.com',
    title: 'Finance Manager', role: 'Finance Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CUST-HELIX'], tenantKeys: ['HELIX-PROD'],
    products: ['WORKWELL_FINANCE'],
  },
  {
    first: 'Jordan', last: 'Blake', email: 'jordan.blake@partnerb.com',
    title: 'Partner Principal', role: 'Organization Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['PARTNER-B'], tenantKeys: ['PARTNER-B-SBX'],
    products: ['WORKWELL_FINANCE'],
  },
  {
    first: 'Sofia', last: 'Lindqvist', email: 'sofia.lindqvist@workwell.io',
    title: 'EU Regional Director', role: 'Organization Admin', status: 'Active', mfa: 'Enforced',
    orgKeys: ['WORKWELL-EU'], tenantKeys: ['WW-EU-INT'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Robert', last: 'Hale', email: 'robert.hale@medpure.health',
    title: 'Clinical Systems Lead', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['MEDPURE-CLINICAL'], tenantKeys: ['MEDPURE-SBX'],
    products: ['MEDPURE'],
  },
  {
    first: 'Tom', last: 'Whitfield', email: 'tom.whitfield@medpure.health',
    title: 'Pharmacy Network Manager', role: 'Tenant Admin', status: 'Active', mfa: 'Enabled',
    orgKeys: ['MEDPURE-PHARMACY'], tenantKeys: ['MEDPURE-PHARM'],
    products: ['MEDPURE', 'CENTAIVA_AI'],
  },
  {
    first: 'Hannah', last: 'Price', email: 'hannah.price@betaretail.co.uk',
    title: 'Regional Manager', role: 'Timesheet Admin', status: 'Active', mfa: 'Disabled',
    orgKeys: ['BETA-NORTH'], tenantKeys: ['BETA-NORTH'],
    products: ['WORKWELL_TIMESHEETS'],
  },
  {
    first: 'Callum', last: 'Reid', email: 'callum.reid@centaiva.com',
    title: 'Platform Engineer', role: 'Platform Owner', status: 'Active', mfa: 'Enforced',
    orgKeys: ['CENTAIVA-INTERNAL'], tenantKeys: ['CTV-STAFF'],
    products: ['CENTAIVA_PLATFORM'],
  },
  {
    first: 'Divya', last: 'Shah', email: 'divya.shah@centaiva.com',
    title: 'Support Engineer', role: 'Read Only', status: 'Active', mfa: 'Enabled',
    orgKeys: ['CENTAIVA-INTERNAL'], tenantKeys: ['CTV-STAFF'],
    products: ['CENTAIVA_PLATFORM', 'CENTAIVA_IDENTITY'],
  },
  {
    first: 'Elliot', last: 'Frost', email: 'elliot.frost@centaiva.com',
    title: 'Release Manager', role: 'Platform Owner', status: 'Disabled', mfa: 'Disabled',
    orgKeys: ['CENTAIVA-INTERNAL'], tenantKeys: ['CTV-STAFF'],
    products: ['CENTAIVA_PLATFORM'],
  },
];

const FILLER_FIRST = ['Amelia', 'Jacob', 'Zainab', 'Oliver', 'Isla', 'Noah', 'Layla', 'Ethan', 'Maya', 'Leo', 'Ruby', 'Felix', 'Nora', 'Hugo', 'Iris', 'Milo', 'Freya', 'Rowan'];
const FILLER_LAST = ['Wright', 'Turner', 'Malik', 'Hughes', 'Robertson', 'Fletcher', 'Ahmed', 'Brooks', 'Sinclair', 'Marshall', 'Coleman', 'Barnes', 'Ellis', 'Newman', 'Rhodes', 'Quinn'];
const FILLER_TITLES = ['Timesheet Reviewer', 'Payroll Analyst', 'Site Coordinator', 'Compliance Analyst', 'Finance Analyst', 'Support Agent', 'Data Analyst', 'Project Manager'];
const FILLER_ROLES = ['Timesheet Reviewer', 'Timesheet Admin', 'Finance Admin', 'Read Only', 'Tenant Admin'];

function orgIdsFor(keys: string[]): string[] {
  return keys.map((key) => ORGANIZATIONS.find((org) => org.key === key)?.id).filter((id): id is string => !!id);
}

function tenantIdsFor(keys: string[]): string[] {
  return keys.map((key) => TENANTS.find((tenant) => tenant.key === key)?.id).filter((id): id is string => !!id);
}

function buildUser(seed: UserSeed, index: number, rnd: () => number): PlatformUser {
  const id = `usr-${seed.first.toLowerCase()}-${seed.last.toLowerCase().replace(/[^a-z]/g, '')}`;
  const orgIds = orgIdsFor(seed.orgKeys);
  const tenantIds = tenantIdsFor(seed.tenantKeys);
  const lastSignIn = seed.status === 'Invited' ? null : minutesAgo(intBetween(4, 20_000, rnd));

  return {
    id,
    displayName: `${seed.first} ${seed.last}`,
    firstName: seed.first,
    lastName: seed.last,
    email: seed.email,
    jobTitle: seed.title,
    status: seed.status,
    mfa: seed.mfa,
    emailVerified: seed.status !== 'Invited',
    organizationIds: orgIds,
    tenantIds,
    productKeys: seed.products,
    roleIds: [`role-${seed.role.toLowerCase().replace(/\s+/g, '-')}`],
    primaryRole: seed.role,
    locale: seed.email.endsWith('.nl') ? 'nl-NL' : seed.email.endsWith('.eu') ? 'da-DK' : seed.email.endsWith('.com') && index % 7 === 0 ? 'en-US' : 'en-GB',
    timeZone: seed.email.endsWith('.nl') ? 'Europe/Amsterdam' : 'Europe/London',
    createdAt: daysAgo(intBetween(20, 1000, rnd)),
    lastSignInAt: lastSignIn,
    lastSignInIp: `51.${intBetween(10, 240, rnd)}.${intBetween(10, 240, rnd)}.${intBetween(2, 250, rnd)}`,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]!,
    organizations: seed.orgKeys.map((key, i) => {
      const org = ORGANIZATIONS.find((o) => o.key === key)!;
      return {
        id: org.id,
        name: org.name,
        key: org.key,
        role: i === 0 ? seed.role : 'Read Only',
        joinedAt: daysAgo(intBetween(20, 800, rnd)),
      };
    }),
    tenants: seed.tenantKeys.map((key, i) => {
      const tenant = TENANTS.find((t) => t.key === key)!;
      return {
        id: tenant.id,
        name: tenant.name,
        key: tenant.key,
        role: i === 0 ? seed.role : 'Read Only',
        joinedAt: daysAgo(intBetween(10, 600, rnd)),
      };
    }),
    sessions: seed.status === 'Active'
      ? Array.from({ length: intBetween(1, 3, rnd) }, (_, i) => ({
          id: `${id}-ses-${i + 1}`,
          device: pick(['Windows 11 Desktop', 'MacBook Pro', 'iPhone 15', 'iPad Pro', 'Android Pixel 8'], rnd),
          browser: pick(['Edge 139', 'Chrome 141', 'Safari 18', 'Firefox 133'], rnd),
          ipAddress: `51.${intBetween(10, 240, rnd)}.${intBetween(10, 240, rnd)}.${intBetween(2, 250, rnd)}`,
          location: pick(['London, UK', 'Manchester, UK', 'Amsterdam, NL', 'Copenhagen, DK', 'New York, US'], rnd),
          startedAt: minutesAgo(intBetween(20, 900, rnd)),
          lastActiveAt: minutesAgo(intBetween(1, 40, rnd)),
          current: i === 0,
        }))
      : [],
    securityEvents: Array.from({ length: 5 }, (_, i) => ({
      id: `${id}-sec-${i + 1}`,
      event: pick(['Sign in', 'MFA challenge', 'Password change', 'Session revoked', 'Failed sign in'], rnd),
      detail: pick([
        'Authenticated with Microsoft Entra ID',
        'MFA satisfied via authenticator app',
        'Password rotated by the account owner',
        'Session revoked by a platform administrator',
        'Credential rejected — incorrect password',
      ], rnd),
      timestamp: minutesAgo(intBetween(30, 40_000, rnd)),
      outcome: i === 3 ? 'Failure' : 'Success',
    })),
    defaultEnvironment: 'Production',
  };
}

function buildUsers(): PlatformUser[] {
  const rnd = seeded(7719);
  const users = HEADLINE_USERS.map((seed, index) => buildUser(seed, index, rnd));

  for (let i = 0; i < 34; i++) {
    const first = FILLER_FIRST[i % FILLER_FIRST.length]!;
    const last = FILLER_LAST[(i * 3) % FILLER_LAST.length]!;
    const tenant = TENANTS[(i * 5) % TENANTS.length]!;
    const organization = ORGANIZATIONS.find((org) => org.id === tenant.organizationId)!;
    const status: UserStatus = i % 11 === 0 ? 'Invited' : i % 13 === 0 ? 'Disabled' : i % 17 === 0 ? 'Suspended' : 'Active';

    users.push(
      buildUser(
        {
          first,
          last,
          email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@${organization.slug}.com`,
          title: FILLER_TITLES[i % FILLER_TITLES.length]!,
          role: FILLER_ROLES[i % FILLER_ROLES.length]!,
          status,
          mfa: i % 3 === 0 ? 'Disabled' : i % 5 === 0 ? 'Enforced' : 'Enabled',
          orgKeys: [organization.key],
          tenantKeys: [tenant.key],
          products: tenant.productKeys.slice(0, 2),
        },
        users.length,
        rnd,
      ),
    );
  }

  return users;
}

export const USERS: PlatformUser[] = buildUsers();

export const CURRENT_USER: PlatformUser = USERS[0]!;
