import { Organization, OrganizationMember, OrganizationType, RegionName } from '../../models';
import { daysAgo, intBetween, seeded } from '../mock-utils';

/**
 * The Centaiva hierarchy is recursive without a fixed depth limit. The seed
 * below intentionally goes six levels deep (Platform > Vendor > Region >
 * Customer > Division > Site) so the tree UI is exercised properly.
 */
interface OrgSeed {
  name: string;
  key: string;
  type: OrganizationType;
  region: RegionName;
  owner: string;
  email: string;
  description: string;
  children?: OrgSeed[];
}

const HIERARCHY: OrgSeed[] = [
  {
    name: 'Centaiva',
    key: 'CENTAIVA',
    type: 'Platform',
    region: 'UK South',
    owner: 'Talha Hassan',
    email: 'talha.hassan@centaiva.com',
    description: 'Root platform organization owning every Centaiva product line.',
    children: [
      {
        name: 'WorkWell',
        key: 'WORKWELL',
        type: 'Vendor',
        region: 'UK South',
        owner: 'Sarah Ahmed',
        email: 'sarah.ahmed@workwell.io',
        description: 'Workforce operations product family covering timesheets and finance.',
        children: [
          {
            name: 'WorkWell UK',
            key: 'WORKWELL-UK',
            type: 'Region',
            region: 'UK South',
            owner: 'John Smith',
            email: 'john.smith@workwell.io',
            description: 'United Kingdom trading region for the WorkWell product family.',
            children: [
              {
                name: 'Customer Alpha',
                key: 'CUST-ALPHA',
                type: 'Customer',
                region: 'UK South',
                owner: 'Emily Carter',
                email: 'emily.carter@alpha-group.co.uk',
                description: 'Multi-entity construction group operating across the UK.',
                children: [
                  {
                    name: 'Alpha Construction',
                    key: 'ALPHA-CONSTRUCTION',
                    type: 'Division',
                    region: 'UK South',
                    owner: 'Daniel Reid',
                    email: 'daniel.reid@alpha-group.co.uk',
                    description: 'Civil construction division with site-level timesheet capture.',
                    children: [
                      {
                        name: 'Alpha Site — Manchester',
                        key: 'ALPHA-SITE-MAN',
                        type: 'Division',
                        region: 'UK West',
                        owner: 'Priya Nair',
                        email: 'priya.nair@alpha-group.co.uk',
                        description: 'Manchester delivery site, 180 field operatives.',
                      },
                      {
                        name: 'Alpha Site — Leeds',
                        key: 'ALPHA-SITE-LDS',
                        type: 'Division',
                        region: 'UK West',
                        owner: 'Owen Bradley',
                        email: 'owen.bradley@alpha-group.co.uk',
                        description: 'Leeds delivery site operating on the Business plan.',
                      },
                    ],
                  },
                  {
                    name: 'Alpha Facilities',
                    key: 'ALPHA-FACILITIES',
                    type: 'Division',
                    region: 'UK South',
                    owner: 'Grace Kelly',
                    email: 'grace.kelly@alpha-group.co.uk',
                    description: 'Facilities management division sharing the Alpha licence pool.',
                  },
                ],
              },
              {
                name: 'Customer Beta',
                key: 'CUST-BETA',
                type: 'Customer',
                region: 'UK South',
                owner: 'David Wilson',
                email: 'david.wilson@betaretail.co.uk',
                description: 'Retail chain with 42 stores using WorkWell Timesheets.',
                children: [
                  {
                    name: 'Beta Retail North',
                    key: 'BETA-NORTH',
                    type: 'Division',
                    region: 'UK West',
                    owner: 'Hannah Price',
                    email: 'hannah.price@betaretail.co.uk',
                    description: 'Northern store cluster.',
                  },
                ],
              },
              {
                name: 'Customer Gamma',
                key: 'CUST-GAMMA',
                type: 'Customer',
                region: 'UK South',
                owner: 'Marcus Lee',
                email: 'marcus.lee@gammalogistics.co.uk',
                description: 'Logistics operator trialling WorkWell Finance.',
              },
            ],
          },
          {
            name: 'WorkWell EU',
            key: 'WORKWELL-EU',
            type: 'Region',
            region: 'EU West',
            owner: 'Sofia Lindqvist',
            email: 'sofia.lindqvist@workwell.io',
            description: 'European trading region with EU data residency.',
            children: [
              {
                name: 'Customer Nordkraft',
                key: 'CUST-NORDKRAFT',
                type: 'Customer',
                region: 'EU West',
                owner: 'Lars Pedersen',
                email: 'lars.pedersen@nordkraft.eu',
                description: 'Energy services customer with EU-only routing.',
              },
              {
                name: 'Customer Vantage BV',
                key: 'CUST-VANTAGE',
                type: 'Customer',
                region: 'EU West',
                owner: 'Anneke de Vries',
                email: 'anneke.devries@vantage.nl',
                description: 'Dutch professional services firm on the Professional plan.',
              },
            ],
          },
        ],
      },
      {
        name: 'MedPure',
        key: 'MEDPURE',
        type: 'Vendor',
        region: 'UK South',
        owner: 'Dr. Aisha Rahman',
        email: 'aisha.rahman@medpure.health',
        description: 'Clinical compliance and pharmacy operations product line.',
        children: [
          {
            name: 'MedPure Clinical',
            key: 'MEDPURE-CLINICAL',
            type: 'Division',
            region: 'UK South',
            owner: 'Robert Hale',
            email: 'robert.hale@medpure.health',
            description: 'Clinical portal division serving NHS trusts.',
            children: [
              {
                name: 'Northside Trust',
                key: 'NORTHSIDE-TRUST',
                type: 'Customer',
                region: 'UK South',
                owner: 'Fiona Grant',
                email: 'fiona.grant@northsidetrust.nhs.uk',
                description: 'NHS trust with strict data residency requirements.',
              },
            ],
          },
          {
            name: 'MedPure Pharmacy',
            key: 'MEDPURE-PHARMACY',
            type: 'Division',
            region: 'UK West',
            owner: 'Tom Whitfield',
            email: 'tom.whitfield@medpure.health',
            description: 'Community pharmacy network division.',
          },
        ],
      },
      {
        name: 'Partner Network',
        key: 'PARTNER-NETWORK',
        type: 'Partner',
        region: 'UK South',
        owner: 'Nadia Farouk',
        email: 'nadia.farouk@centaiva.com',
        description: 'Umbrella organization for all Centaiva delegated licensing partners.',
        children: [
          {
            name: 'Partner A',
            key: 'PARTNER-A',
            type: 'Partner',
            region: 'UK South',
            owner: 'Ian McAllister',
            email: 'ian.mcallister@partnera.com',
            description: 'Tier one delivery partner holding a 400 seat licence pool.',
            children: [
              {
                name: 'Reseller A1',
                key: 'RESELLER-A1',
                type: 'Reseller',
                region: 'UK South',
                owner: 'Chloe Bennett',
                email: 'chloe.bennett@resellera1.com',
                description: 'Reseller with a delegated 150 seat sub-pool.',
                children: [
                  {
                    name: 'Customer Delta',
                    key: 'CUST-DELTA',
                    type: 'Customer',
                    region: 'UK South',
                    owner: 'Ryan Foster',
                    email: 'ryan.foster@deltaworks.co.uk',
                    description: 'End customer served entirely through the reseller channel.',
                    children: [
                      {
                        name: 'Delta Field Services',
                        key: 'DELTA-FIELD',
                        type: 'Division',
                        region: 'UK South',
                        owner: 'Megan Doyle',
                        email: 'megan.doyle@deltaworks.co.uk',
                        description: 'Field services division consuming 60 delegated seats.',
                      },
                    ],
                  },
                  {
                    name: 'Customer Epsilon',
                    key: 'CUST-EPSILON',
                    type: 'Customer',
                    region: 'UK West',
                    owner: 'Peter Nash',
                    email: 'peter.nash@epsilonhold.co.uk',
                    description: 'Holdings company piloting Centaiva AI.',
                  },
                ],
              },
              {
                name: 'Reseller A2',
                key: 'RESELLER-A2',
                type: 'Reseller',
                region: 'EU West',
                owner: 'Marta Kowalski',
                email: 'marta.kowalski@resellera2.eu',
                description: 'European reseller with a 90 seat sub-pool.',
              },
            ],
          },
          {
            name: 'Partner B',
            key: 'PARTNER-B',
            type: 'Partner',
            region: 'US East',
            owner: 'Jordan Blake',
            email: 'jordan.blake@partnerb.com',
            description: 'North American partner covering the US East region.',
            children: [
              {
                name: 'Customer Helix Inc',
                key: 'CUST-HELIX',
                type: 'Customer',
                region: 'US East',
                owner: 'Alicia Moreno',
                email: 'alicia.moreno@helix.com',
                description: 'US customer running WorkWell Finance in production.',
              },
            ],
          },
        ],
      },
      {
        name: 'Centaiva Internal',
        key: 'CENTAIVA-INTERNAL',
        type: 'Division',
        region: 'UK South',
        owner: 'Talha Hassan',
        email: 'talha.hassan@centaiva.com',
        description: 'Internal staff organization for platform engineering and support.',
      },
    ],
  },
];

const MEMBER_ROLES = ['Organization Admin', 'Finance Admin', 'Tenant Admin', 'Read Only', 'Support Agent'];
const MEMBER_NAMES = [
  'Amelia Wright',
  'Jacob Turner',
  'Zainab Malik',
  'Oliver Hughes',
  'Isla Robertson',
  'Noah Fletcher',
  'Layla Ahmed',
  'Ethan Brooks',
  'Maya Sinclair',
  'Leo Marshall',
];

function buildMembers(orgKey: string, count: number, rnd: () => number): OrganizationMember[] {
  return Array.from({ length: count }, (_, index) => {
    const name = MEMBER_NAMES[(index + orgKey.length) % MEMBER_NAMES.length]!;
    return {
      id: `${orgKey.toLowerCase()}-mem-${index + 1}`,
      userId: `usr-${orgKey.toLowerCase()}-${index + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${orgKey.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
      role: MEMBER_ROLES[(index + 1) % MEMBER_ROLES.length]!,
      status: index === 3 ? 'Invited' : 'Active',
      addedAt: daysAgo(intBetween(20, 620, rnd)),
    } satisfies OrganizationMember;
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function flatten(): Organization[] {
  const rnd = seeded(4211);
  const result: Organization[] = [];

  const walk = (seed: OrgSeed, parentId: string | null, path: string[], depth: number): void => {
    const id = `org-${slugify(seed.key)}`;
    const children = seed.children ?? [];
    const seats = intBetween(20, 900, rnd);
    const memberCount = intBetween(3, 9, rnd);

    result.push({
      id,
      name: seed.name,
      key: seed.key,
      slug: slugify(seed.name),
      type: seed.type,
      parentId,
      path: [...path, id],
      region: seed.region,
      timeZone: seed.region === 'US East' ? 'America/New_York' : seed.region === 'EU West' ? 'Europe/Amsterdam' : 'Europe/London',
      status: seed.key === 'CUST-GAMMA' ? 'Pending' : seed.key === 'RESELLER-A2' ? 'Suspended' : 'Active',
      createdAt: daysAgo(intBetween(40, 900, rnd) + depth * 15),
      description: seed.description,
      tenantCount: 0,
      memberCount,
      childCount: children.length,
      licenseSeats: seats,
      licenseSeatsUsed: Math.round(seats * (0.42 + rnd() * 0.5)),
      ownerName: seed.owner,
      ownerEmail: seed.email,
      commercial: {
        billingAccount: `BA-${slugify(seed.key).toUpperCase()}`,
        currency: seed.region === 'US East' ? 'USD' : seed.region === 'EU West' ? 'EUR' : 'GBP',
        paymentTerms: 'Net 30',
        contractStart: daysAgo(intBetween(200, 720, rnd)),
        contractEnd: daysAgo(-intBetween(60, 600, rnd)),
        annualValue: intBetween(12, 480, rnd) * 1000,
        invoiceEmail: `billing@${slugify(seed.key)}.com`,
      },
      members: buildMembers(seed.key, memberCount, rnd),
    });

    for (const child of children) {
      walk(child, id, [...path, id], depth + 1);
    }
  };

  for (const root of HIERARCHY) {
    walk(root, null, [], 0);
  }

  return result;
}

export const ORGANIZATIONS: Organization[] = flatten();

export function organizationByKey(key: string): Organization {
  const found = ORGANIZATIONS.find((org) => org.key === key);
  if (!found) {
    throw new Error(`Unknown seed organization key: ${key}`);
  }
  return found;
}
