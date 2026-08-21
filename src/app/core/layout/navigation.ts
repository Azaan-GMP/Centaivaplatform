export interface NavItem {
  label: string;
  route: string;
  icon: string;
  /** Matches child routes as well (detail pages keep their parent highlighted). */
  prefixMatch?: boolean;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Overview', route: '/app/overview', icon: 'pi pi-home' }],
  },
  {
    label: 'Identity & Access',
    items: [
      { label: 'Users', route: '/app/users', icon: 'pi pi-users', prefixMatch: true },
      { label: 'Organizations', route: '/app/organizations', icon: 'pi pi-sitemap', prefixMatch: true },
      { label: 'Tenants', route: '/app/tenants', icon: 'pi pi-building', prefixMatch: true },
      { label: 'Roles & Permissions', route: '/app/access/roles', icon: 'pi pi-shield', prefixMatch: true },
      { label: 'Invitations', route: '/app/invitations', icon: 'pi pi-envelope' },
    ],
  },
  {
    label: 'Product Catalog',
    items: [
      { label: 'Products', route: '/app/products', icon: 'pi pi-box', prefixMatch: true },
      { label: 'Applications', route: '/app/applications', icon: 'pi pi-desktop', prefixMatch: true },
      { label: 'Modules & Features', route: '/app/catalog', icon: 'pi pi-th-large' },
      { label: 'Plans', route: '/app/plans', icon: 'pi pi-tags', prefixMatch: true },
      { label: 'Entitlements', route: '/app/entitlements', icon: 'pi pi-unlock' },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { label: 'Subscriptions', route: '/app/subscriptions', icon: 'pi pi-credit-card', prefixMatch: true },
      { label: 'Licenses', route: '/app/licenses', icon: 'pi pi-id-card', prefixMatch: true },
      { label: 'License Pools', route: '/app/license-pools', icon: 'pi pi-share-alt' },
      { label: 'Usage & Quotas', route: '/app/usage', icon: 'pi pi-chart-bar' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Provisioning', route: '/app/provisioning', icon: 'pi pi-bolt' },
      { label: 'Deployments', route: '/app/deployments', icon: 'pi pi-server', prefixMatch: true },
      { label: 'Data Stores', route: '/app/data-stores', icon: 'pi pi-database', prefixMatch: true },
      { label: 'Integrations', route: '/app/integrations', icon: 'pi pi-link' },
    ],
  },
  {
    label: 'Security',
    items: [
      { label: 'Security Overview', route: '/app/security', icon: 'pi pi-verified' },
      { label: 'Identity Providers', route: '/app/security/identity-providers', icon: 'pi pi-key' },
      { label: 'Service Accounts', route: '/app/service-accounts', icon: 'pi pi-cog' },
      { label: 'Feature Flags', route: '/app/feature-flags', icon: 'pi pi-flag' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Regions & Environments', route: '/app/system/regions', icon: 'pi pi-globe' },
      { label: 'Audit Logs', route: '/app/audit', icon: 'pi pi-history' },
      { label: 'Diagnostics', route: '/app/system/diagnostics', icon: 'pi pi-heart' },
      { label: 'Settings', route: '/app/settings', icon: 'pi pi-sliders-h' },
    ],
  },
];

/** Quick-create entries surfaced from the header and the overview dashboard. */
export const QUICK_ACTIONS = [
  { label: 'Create Organization', icon: 'pi pi-sitemap', route: '/app/organizations', description: 'Add a node anywhere in the hierarchy' },
  { label: 'Create Tenant', icon: 'pi pi-building', route: '/app/tenants', description: 'Provision a new tenant workspace' },
  { label: 'Invite User', icon: 'pi pi-user-plus', route: '/app/invitations', description: 'Send a platform invitation' },
  { label: 'Create Product', icon: 'pi pi-box', route: '/app/products', description: 'Register a new product line' },
  { label: 'Create Subscription', icon: 'pi pi-credit-card', route: '/app/subscriptions', description: 'Attach a plan to a tenant' },
  { label: 'Issue License', icon: 'pi pi-id-card', route: '/app/licenses', description: 'Issue seats against a subscription' },
];

/** Page titles keyed by route prefix, used by the header breadcrumb. */
export const ROUTE_TITLES: { prefix: string; title: string; parent?: { label: string; route: string } }[] = [
  { prefix: '/app/overview', title: 'Platform Overview' },
  { prefix: '/app/users', title: 'Users' },
  { prefix: '/app/organizations', title: 'Organizations' },
  { prefix: '/app/tenants', title: 'Tenants' },
  { prefix: '/app/access/roles', title: 'Roles & Permissions' },
  { prefix: '/app/invitations', title: 'Invitations' },
  { prefix: '/app/products', title: 'Products' },
  { prefix: '/app/applications', title: 'Applications' },
  { prefix: '/app/catalog', title: 'Product Catalog' },
  { prefix: '/app/plans', title: 'Plans' },
  { prefix: '/app/entitlements', title: 'Entitlements' },
  { prefix: '/app/subscriptions', title: 'Subscriptions' },
  { prefix: '/app/licenses', title: 'Licenses' },
  { prefix: '/app/license-pools', title: 'License Pools' },
  { prefix: '/app/usage', title: 'Usage & Quotas' },
  { prefix: '/app/onboarding', title: 'Customer Onboarding' },
  { prefix: '/app/provisioning', title: 'Provisioning' },
  { prefix: '/app/deployments', title: 'Deployments' },
  { prefix: '/app/data-stores', title: 'Data Stores' },
  { prefix: '/app/integrations', title: 'Integrations' },
  { prefix: '/app/security/identity-providers', title: 'Identity Providers', parent: { label: 'Security', route: '/app/security' } },
  { prefix: '/app/security', title: 'Security' },
  { prefix: '/app/service-accounts', title: 'Service Accounts' },
  { prefix: '/app/feature-flags', title: 'Feature Flags' },
  { prefix: '/app/audit', title: 'Audit Logs' },
  { prefix: '/app/system/regions', title: 'Regions & Environments' },
  { prefix: '/app/system/diagnostics', title: 'Diagnostics' },
  { prefix: '/app/settings', title: 'Settings' },
];
