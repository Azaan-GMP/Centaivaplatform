import {
  Application,
  ApplicationType,
  Feature,
  Permission,
  Product,
  ProductModule,
} from '../../models';
import { daysAgo, intBetween, seeded } from '../mock-utils';

/* =========================================================
   Product > Application > Module > Feature > Permission
   ========================================================= */

interface PermissionSeed {
  key: string;
  name: string;
  description: string;
  risk: Permission['risk'];
}

interface FeatureSeed {
  name: string;
  key: string;
  description: string;
  permissions: PermissionSeed[];
}

interface ModuleSeed {
  name: string;
  key: string;
  description: string;
  features: FeatureSeed[];
}

interface ApplicationSeed {
  name: string;
  key: string;
  type: ApplicationType;
  description: string;
  baseUrl: string;
  version: string;
  status: Application['status'];
  modules: ModuleSeed[];
}

interface ProductSeed {
  name: string;
  key: string;
  description: string;
  status: Product['status'];
  lifecycle: Product['lifecycle'];
  version: string;
  owner: string;
  accent: string;
  applications: ApplicationSeed[];
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    name: 'WorkWell Timesheets',
    key: 'WORKWELL_TIMESHEETS',
    description: 'Field and office time capture with approval workflows, cost coding and payroll export.',
    status: 'Active',
    lifecycle: 'GA',
    version: '4.8.2',
    owner: 'Sarah Ahmed',
    accent: '#1a73e8',
    applications: [
      {
        name: 'WorkWell Timesheets Web',
        key: 'WW_TS_WEB',
        type: 'Web',
        description: 'Browser application used by operatives, reviewers and administrators.',
        baseUrl: 'https://timesheets.workwell.io',
        version: '4.8.2',
        status: 'Active',
        modules: [
          {
            name: 'Timesheet Processing',
            key: 'TIMESHEET_PROCESSING',
            description: 'Capture, review and approval of submitted timesheets.',
            features: [
              {
                name: 'Review Timesheet',
                key: 'REVIEW_TIMESHEET',
                description: 'Reviewer queue with line level adjustments and comments.',
                permissions: [
                  { key: 'TIMESHEET.REVIEW', name: 'Review timesheet', description: 'Open and amend submitted timesheets.', risk: 'Medium' },
                  { key: 'TIMESHEET.APPROVE', name: 'Approve timesheet', description: 'Approve a timesheet for payroll export.', risk: 'High' },
                  { key: 'TIMESHEET.REJECT', name: 'Reject timesheet', description: 'Return a timesheet to the submitter.', risk: 'Medium' },
                ],
              },
              {
                name: 'Submit Timesheet',
                key: 'SUBMIT_TIMESHEET',
                description: 'Operative submission with offline capture support.',
                permissions: [
                  { key: 'TIMESHEET.CREATE', name: 'Create timesheet', description: 'Create a new timesheet entry.', risk: 'Low' },
                  { key: 'TIMESHEET.SUBMIT', name: 'Submit timesheet', description: 'Submit a timesheet for review.', risk: 'Low' },
                ],
              },
              {
                name: 'Bulk Approval',
                key: 'BULK_APPROVAL',
                description: 'Approve an entire period across a cost centre in one action.',
                permissions: [
                  { key: 'TIMESHEET.BULK_APPROVE', name: 'Bulk approve', description: 'Approve many timesheets at once.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Scheduling',
            key: 'SCHEDULING',
            description: 'Shift patterns, rotas and site allocation.',
            features: [
              {
                name: 'Shift Planner',
                key: 'SHIFT_PLANNER',
                description: 'Drag and drop rota planning by site.',
                permissions: [
                  { key: 'SHIFT.VIEW', name: 'View shifts', description: 'View published rotas.', risk: 'Low' },
                  { key: 'SHIFT.PUBLISH', name: 'Publish shifts', description: 'Publish a rota to operatives.', risk: 'Medium' },
                ],
              },
              {
                name: 'Absence Management',
                key: 'ABSENCE',
                description: 'Holiday, sickness and unpaid leave tracking.',
                permissions: [
                  { key: 'ABSENCE.APPROVE', name: 'Approve absence', description: 'Approve leave requests.', risk: 'Medium' },
                ],
              },
            ],
          },
          {
            name: 'Reporting',
            key: 'TS_REPORTING',
            description: 'Operational and cost reporting across sites.',
            features: [
              {
                name: 'Standard Reports',
                key: 'STANDARD_REPORTS',
                description: 'Pre-built cost, utilisation and compliance reports.',
                permissions: [
                  { key: 'REPORT.VIEW', name: 'View reports', description: 'Run and view standard reports.', risk: 'Low' },
                  { key: 'REPORT.EXPORT', name: 'Export reports', description: 'Export report data to CSV or Excel.', risk: 'Medium' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'WorkWell Timesheets API',
        key: 'WW_TS_API',
        type: 'API',
        description: 'Public REST surface for timesheet ingestion and payroll export.',
        baseUrl: 'https://api.workwell.io/timesheets/v4',
        version: '4.8.0',
        status: 'Active',
        modules: [
          {
            name: 'Ingestion',
            key: 'TS_INGESTION',
            description: 'Bulk timesheet ingestion endpoints.',
            features: [
              {
                name: 'Batch Import',
                key: 'BATCH_IMPORT',
                description: 'Import timesheet batches from external systems.',
                permissions: [
                  { key: 'API.TIMESHEET.WRITE', name: 'Write timesheets', description: 'Create timesheets through the API.', risk: 'High' },
                  { key: 'API.TIMESHEET.READ', name: 'Read timesheets', description: 'Read timesheet data through the API.', risk: 'Low' },
                ],
              },
            ],
          },
          {
            name: 'Payroll Export',
            key: 'PAYROLL_EXPORT',
            description: 'Approved period export to payroll providers.',
            features: [
              {
                name: 'Export Runs',
                key: 'EXPORT_RUNS',
                description: 'Trigger and monitor payroll export runs.',
                permissions: [
                  { key: 'PAYROLL.EXPORT', name: 'Run payroll export', description: 'Trigger a payroll export run.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'WorkWell Finance',
    key: 'WORKWELL_FINANCE',
    description: 'Cost control, invoicing and multi-entity financial reporting for workforce operations.',
    status: 'Active',
    lifecycle: 'GA',
    version: '3.2.1',
    owner: 'Emily Carter',
    accent: '#34a853',
    applications: [
      {
        name: 'WorkWell Finance Web',
        key: 'WW_FIN_WEB',
        type: 'Web',
        description: 'Finance workspace for invoicing, cost allocation and reporting.',
        baseUrl: 'https://finance.workwell.io',
        version: '3.2.1',
        status: 'Active',
        modules: [
          {
            name: 'Invoicing',
            key: 'INVOICING',
            description: 'Sales and purchase invoice lifecycle.',
            features: [
              {
                name: 'Invoice Register',
                key: 'INVOICE_REGISTER',
                description: 'Central register of issued and received invoices.',
                permissions: [
                  { key: 'INVOICE.VIEW', name: 'View invoices', description: 'View the invoice register.', risk: 'Low' },
                  { key: 'INVOICE.CREATE', name: 'Create invoice', description: 'Raise a new invoice.', risk: 'Medium' },
                  { key: 'INVOICE.APPROVE', name: 'Approve invoice', description: 'Approve an invoice for payment.', risk: 'High' },
                ],
              },
              {
                name: 'Credit Notes',
                key: 'CREDIT_NOTES',
                description: 'Credit note issue and matching.',
                permissions: [
                  { key: 'CREDIT_NOTE.CREATE', name: 'Create credit note', description: 'Issue a credit note.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Cost Control',
            key: 'COST_CONTROL',
            description: 'Budget, commitment and actual cost tracking.',
            features: [
              {
                name: 'Budgets',
                key: 'BUDGETS',
                description: 'Budget definition by project and cost centre.',
                permissions: [
                  { key: 'BUDGET.VIEW', name: 'View budgets', description: 'View budget positions.', risk: 'Low' },
                  { key: 'BUDGET.EDIT', name: 'Edit budgets', description: 'Amend budget values.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Multi Entity',
            key: 'MULTI_ENTITY',
            description: 'Consolidated reporting across legal entities.',
            features: [
              {
                name: 'Entity Consolidation',
                key: 'ENTITY_CONSOLIDATION',
                description: 'Roll up financial positions across the group.',
                permissions: [
                  { key: 'ENTITY.CONSOLIDATE', name: 'Consolidate entities', description: 'Run group consolidation.', risk: 'Medium' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'WorkWell Finance API',
        key: 'WW_FIN_API',
        type: 'API',
        description: 'Finance integration surface for accounting connectors.',
        baseUrl: 'https://api.workwell.io/finance/v3',
        version: '3.2.0',
        status: 'Active',
        modules: [
          {
            name: 'Ledger Sync',
            key: 'LEDGER_SYNC',
            description: 'Two way ledger synchronisation with accounting providers.',
            features: [
              {
                name: 'Xero Sync',
                key: 'XERO_SYNC',
                description: 'Push and pull ledger entries with Xero.',
                permissions: [
                  { key: 'API.LEDGER.SYNC', name: 'Sync ledger', description: 'Run a ledger synchronisation.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'MedPure',
    key: 'MEDPURE',
    description: 'Clinical compliance, controlled drug registers and pharmacy operations.',
    status: 'Active',
    lifecycle: 'GA',
    version: '2.6.0',
    owner: 'Dr. Aisha Rahman',
    accent: '#7c3aed',
    applications: [
      {
        name: 'MedPure Portal',
        key: 'MEDPURE_PORTAL',
        type: 'Web',
        description: 'Clinical portal for compliance records and audits.',
        baseUrl: 'https://portal.medpure.health',
        version: '2.6.0',
        status: 'Active',
        modules: [
          {
            name: 'Compliance',
            key: 'COMPLIANCE',
            description: 'Regulatory compliance records and attestations.',
            features: [
              {
                name: 'Audit Records',
                key: 'AUDIT_RECORDS',
                description: 'Immutable clinical audit record store.',
                permissions: [
                  { key: 'CLINICAL.AUDIT.VIEW', name: 'View clinical audit', description: 'View clinical audit records.', risk: 'Medium' },
                  { key: 'CLINICAL.AUDIT.SIGN', name: 'Sign audit record', description: 'Countersign an audit record.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Controlled Drugs',
            key: 'CONTROLLED_DRUGS',
            description: 'Controlled drug register and reconciliation.',
            features: [
              {
                name: 'CD Register',
                key: 'CD_REGISTER',
                description: 'Digital controlled drug register with dual signature.',
                permissions: [
                  { key: 'CD.REGISTER.VIEW', name: 'View CD register', description: 'View the controlled drug register.', risk: 'Medium' },
                  { key: 'CD.REGISTER.WRITE', name: 'Write CD register', description: 'Record a controlled drug transaction.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Centaiva Identity',
    key: 'CENTAIVA_IDENTITY',
    description: 'Platform identity, authentication, federation and session management.',
    status: 'Active',
    lifecycle: 'GA',
    version: '5.1.0',
    owner: 'Talha Hassan',
    accent: '#0891b2',
    applications: [
      {
        name: 'Centaiva Identity API',
        key: 'CTV_IDENTITY_API',
        type: 'API',
        description: 'OpenID Connect issuer and user directory surface.',
        baseUrl: 'https://identity.centaiva.com',
        version: '5.1.0',
        status: 'Active',
        modules: [
          {
            name: 'Directory',
            key: 'DIRECTORY',
            description: 'User, group and service account directory.',
            features: [
              {
                name: 'User Management',
                key: 'USER_MANAGEMENT',
                description: 'Directory lifecycle operations for platform users.',
                permissions: [
                  { key: 'USER.CREATE', name: 'Create user', description: 'Create a platform user.', risk: 'High' },
                  { key: 'USER.UPDATE', name: 'Update user', description: 'Amend user attributes.', risk: 'Medium' },
                  { key: 'USER.DISABLE', name: 'Disable user', description: 'Disable a user account.', risk: 'High' },
                  { key: 'USER.VIEW', name: 'View users', description: 'View the user directory.', risk: 'Low' },
                ],
              },
              {
                name: 'Federation',
                key: 'FEDERATION',
                description: 'External identity provider federation.',
                permissions: [
                  { key: 'IDP.CONFIGURE', name: 'Configure identity provider', description: 'Add or amend a federated provider.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Sessions',
            key: 'SESSIONS',
            description: 'Active session inspection and revocation.',
            features: [
              {
                name: 'Session Control',
                key: 'SESSION_CONTROL',
                description: 'Inspect and revoke active sessions.',
                permissions: [
                  { key: 'SESSION.REVOKE', name: 'Revoke session', description: 'Terminate an active session.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Centaiva AI',
    key: 'CENTAIVA_AI',
    description: 'Document extraction, classification and assistive automation services.',
    status: 'Beta',
    lifecycle: 'Beta',
    version: '1.4.0-beta',
    owner: 'Nadia Farouk',
    accent: '#f59e0b',
    applications: [
      {
        name: 'Centaiva AI Service',
        key: 'CTV_AI_SERVICE',
        type: 'Service',
        description: 'Extraction pipeline and model orchestration service.',
        baseUrl: 'https://ai.centaiva.com',
        version: '1.4.0',
        status: 'Beta',
        modules: [
          {
            name: 'Extraction',
            key: 'EXTRACTION',
            description: 'Document ingestion and structured extraction.',
            features: [
              {
                name: 'Document Extraction',
                key: 'DOCUMENT_EXTRACTION',
                description: 'Extract structured fields from uploaded documents.',
                permissions: [
                  { key: 'AI.EXTRACT.RUN', name: 'Run extraction', description: 'Submit a document for extraction.', risk: 'Medium' },
                  { key: 'AI.EXTRACT.REVIEW', name: 'Review extraction', description: 'Review and correct extraction output.', risk: 'Low' },
                ],
              },
            ],
          },
          {
            name: 'Model Operations',
            key: 'MODEL_OPS',
            description: 'Model version selection and evaluation.',
            features: [
              {
                name: 'Model Registry',
                key: 'MODEL_REGISTRY',
                description: 'Registered model versions and rollout state.',
                permissions: [
                  { key: 'AI.MODEL.PROMOTE', name: 'Promote model', description: 'Promote a model version to production.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Centaiva Platform',
    key: 'CENTAIVA_PLATFORM',
    description: 'The control plane itself — tenancy, licensing, provisioning and platform operations.',
    status: 'Active',
    lifecycle: 'GA',
    version: '6.0.3',
    owner: 'Talha Hassan',
    accent: '#111827',
    applications: [
      {
        name: 'Centaiva Admin',
        key: 'CTV_ADMIN',
        type: 'Web',
        description: 'This administration console.',
        baseUrl: 'https://admin.centaiva.com',
        version: '6.0.3',
        status: 'Active',
        modules: [
          {
            name: 'Tenancy',
            key: 'TENANCY',
            description: 'Organization, tenant and membership administration.',
            features: [
              {
                name: 'Tenant Administration',
                key: 'TENANT_ADMIN',
                description: 'Tenant lifecycle and configuration.',
                permissions: [
                  { key: 'TENANT.CREATE', name: 'Create tenant', description: 'Create a new tenant.', risk: 'High' },
                  { key: 'TENANT.UPDATE', name: 'Update tenant', description: 'Amend tenant configuration.', risk: 'Medium' },
                  { key: 'TENANT.VIEW', name: 'View tenants', description: 'View tenant records.', risk: 'Low' },
                ],
              },
              {
                name: 'Organization Administration',
                key: 'ORG_ADMIN',
                description: 'Recursive organization hierarchy management.',
                permissions: [
                  { key: 'ORGANIZATION.CREATE', name: 'Create organization', description: 'Create an organization node.', risk: 'High' },
                  { key: 'ORGANIZATION.MOVE', name: 'Move organization', description: 'Re-parent an organization node.', risk: 'High' },
                ],
              },
            ],
          },
          {
            name: 'Commercial',
            key: 'COMMERCIAL',
            description: 'Plans, subscriptions, licensing and entitlements.',
            features: [
              {
                name: 'Subscription Management',
                key: 'SUBSCRIPTION_MANAGEMENT',
                description: 'Subscription lifecycle across tenants.',
                permissions: [
                  { key: 'SUBSCRIPTION.VIEW', name: 'View subscriptions', description: 'View subscription records.', risk: 'Low' },
                  { key: 'SUBSCRIPTION.CREATE', name: 'Create subscription', description: 'Create a subscription for a tenant.', risk: 'High' },
                ],
              },
              {
                name: 'Licence Administration',
                key: 'LICENCE_ADMIN',
                description: 'Licence issue, rotation and revocation.',
                permissions: [
                  { key: 'LICENSE.ISSUE', name: 'Issue licence', description: 'Issue a new licence.', risk: 'High' },
                  { key: 'LICENSE.REVOKE', name: 'Revoke licence', description: 'Revoke an active licence.', risk: 'High' },
                  { key: 'LICENSE.VIEW', name: 'View licences', description: 'View licence records.', risk: 'Low' },
                ],
              },
            ],
          },
          {
            name: 'Operations',
            key: 'OPERATIONS',
            description: 'Provisioning, deployments and data routing.',
            features: [
              {
                name: 'Provisioning Runs',
                key: 'PROVISIONING_RUNS',
                description: 'Tenant provisioning execution and retries.',
                permissions: [
                  { key: 'PROVISIONING.RUN', name: 'Run provisioning', description: 'Start a provisioning run.', risk: 'High' },
                  { key: 'PROVISIONING.VIEW', name: 'View provisioning', description: 'View provisioning history.', risk: 'Low' },
                ],
              },
              {
                name: 'Audit Access',
                key: 'AUDIT_ACCESS',
                description: 'Platform audit log search and export.',
                permissions: [
                  { key: 'AUDIT.VIEW', name: 'View audit log', description: 'Search the platform audit log.', risk: 'Medium' },
                  { key: 'AUDIT.EXPORT', name: 'Export audit log', description: 'Export audit events.', risk: 'High' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/* ---------------- Flattening ---------------- */

const rnd = seeded(90210);

const applications: Application[] = [];
const products: Product[] = [];
const permissions: Permission[] = [];

for (const productSeed of PRODUCT_SEEDS) {
  let productModules = 0;
  let productFeatures = 0;
  let productPermissions = 0;

  for (const appSeed of productSeed.applications) {
    const applicationId = `app-${appSeed.key.toLowerCase().replace(/_/g, '-')}`;
    let appFeatures = 0;
    let appPermissions = 0;

    const modules: ProductModule[] = appSeed.modules.map((moduleSeed) => {
      const moduleId = `mod-${moduleSeed.key.toLowerCase().replace(/_/g, '-')}`;

      const features: Feature[] = moduleSeed.features.map((featureSeed) => {
        const featureId = `feat-${featureSeed.key.toLowerCase().replace(/_/g, '-')}`;
        const featurePermissions: Permission[] = featureSeed.permissions.map((permissionSeed) => {
          const permission: Permission = {
            id: `perm-${permissionSeed.key.toLowerCase().replace(/[._]/g, '-')}`,
            key: permissionSeed.key,
            name: permissionSeed.name,
            description: permissionSeed.description,
            featureId,
            moduleId,
            applicationId,
            productKey: productSeed.key,
            risk: permissionSeed.risk,
          };
          permissions.push(permission);
          return permission;
        });

        appPermissions += featurePermissions.length;

        return {
          id: featureId,
          name: featureSeed.name,
          key: featureSeed.key,
          description: featureSeed.description,
          moduleId,
          applicationId,
          productKey: productSeed.key,
          status: productSeed.lifecycle === 'Beta' ? 'Beta' : 'Active',
          permissions: featurePermissions,
        } satisfies Feature;
      });

      appFeatures += features.length;

      return {
        id: moduleId,
        name: moduleSeed.name,
        key: moduleSeed.key,
        description: moduleSeed.description,
        applicationId,
        productKey: productSeed.key,
        status: productSeed.lifecycle === 'Beta' ? 'Beta' : 'Active',
        features,
      } satisfies ProductModule;
    });

    productModules += modules.length;
    productFeatures += appFeatures;
    productPermissions += appPermissions;

    applications.push({
      id: applicationId,
      name: appSeed.name,
      key: appSeed.key,
      productKey: productSeed.key,
      productName: productSeed.name,
      type: appSeed.type,
      status: appSeed.status,
      description: appSeed.description,
      baseUrl: appSeed.baseUrl,
      version: appSeed.version,
      moduleCount: modules.length,
      featureCount: appFeatures,
      permissionCount: appPermissions,
      createdAt: daysAgo(intBetween(300, 1100, rnd)),
      modules,
    });
  }

  products.push({
    id: `prd-${productSeed.key.toLowerCase().replace(/_/g, '-')}`,
    name: productSeed.name,
    key: productSeed.key,
    description: productSeed.description,
    status: productSeed.status,
    lifecycle: productSeed.lifecycle,
    version: productSeed.version,
    owner: productSeed.owner,
    iconAccent: productSeed.accent,
    applicationCount: productSeed.applications.length,
    moduleCount: productModules,
    featureCount: productFeatures,
    permissionCount: productPermissions,
    tenantCount: 0,
    subscriptionCount: 0,
    activeUsers: intBetween(120, 1400, rnd),
    createdAt: daysAgo(intBetween(400, 1400, rnd)),
    meters: [],
  });
}

/* ---------------- Meters ---------------- */

const METERS: Record<string, Product['meters']> = {
  WORKWELL_TIMESHEETS: [
    { id: 'mtr-ts-submissions', name: 'Timesheet Submissions', key: 'TIMESHEET_SUBMISSIONS', unit: 'submissions', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Timesheets submitted for review in the period.' },
    { id: 'mtr-ts-api', name: 'API Calls', key: 'API_CALLS', unit: 'calls', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Requests against the timesheets API.' },
    { id: 'mtr-ts-users', name: 'Active Users', key: 'ACTIVE_USERS', unit: 'users', aggregation: 'Unique', resetPeriod: 'Monthly', description: 'Distinct users signing in during the period.' },
  ],
  WORKWELL_FINANCE: [
    { id: 'mtr-fin-invoices', name: 'Invoices Processed', key: 'INVOICES_PROCESSED', unit: 'invoices', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Invoices raised or received.' },
    { id: 'mtr-fin-storage', name: 'Storage Used', key: 'STORAGE_USED', unit: 'GB', aggregation: 'Max', resetPeriod: 'Never', description: 'Document storage consumed by the tenant.' },
  ],
  MEDPURE: [
    { id: 'mtr-med-records', name: 'Compliance Records', key: 'COMPLIANCE_RECORDS', unit: 'records', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Clinical compliance records written.' },
  ],
  CENTAIVA_AI: [
    { id: 'mtr-ai-extractions', name: 'AI Extractions', key: 'AI_EXTRACTIONS', unit: 'extractions', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Documents processed by the extraction pipeline.' },
    { id: 'mtr-ai-documents', name: 'Documents Processed', key: 'DOCUMENTS_PROCESSED', unit: 'documents', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Documents ingested for processing.' },
  ],
  CENTAIVA_IDENTITY: [
    { id: 'mtr-id-auth', name: 'Authentications', key: 'AUTHENTICATIONS', unit: 'sign-ins', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Successful authentication events.' },
  ],
  CENTAIVA_PLATFORM: [
    { id: 'mtr-plat-api', name: 'Control Plane API Calls', key: 'CONTROL_PLANE_CALLS', unit: 'calls', aggregation: 'Sum', resetPeriod: 'Monthly', description: 'Administration API requests.' },
  ],
};

for (const product of products) {
  product.meters = METERS[product.key] ?? [];
}

export const PRODUCTS: Product[] = products;
export const APPLICATIONS: Application[] = applications;
export const PERMISSIONS: Permission[] = permissions;

export const PRODUCT_NAME_BY_KEY: Record<string, string> = Object.fromEntries(
  PRODUCTS.map((product) => [product.key, product.name]),
);
