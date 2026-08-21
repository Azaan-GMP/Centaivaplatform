import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
    title: 'Sign in · Centaiva Platform',
  },

  {
    path: 'app',
    loadComponent: () => import('./core/layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },

      {
        path: 'overview',
        loadComponent: () => import('./features/overview/overview.page').then((m) => m.OverviewPage),
        title: 'Platform Overview · Centaiva',
      },

      /* ---------------- Identity & access ---------------- */
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.page').then((m) => m.UsersPage),
        title: 'Users · Centaiva',
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-detail.page').then((m) => m.UserDetailPage),
        title: 'User · Centaiva',
      },
      {
        path: 'organizations',
        loadComponent: () => import('./features/organizations/organizations.page').then((m) => m.OrganizationsPage),
        title: 'Organizations · Centaiva',
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./features/organizations/organizations.page').then((m) => m.OrganizationsPage),
        title: 'Organization · Centaiva',
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/tenants/tenants.page').then((m) => m.TenantsPage),
        title: 'Tenants · Centaiva',
      },
      {
        path: 'tenants/:id',
        loadComponent: () => import('./features/tenants/tenant-detail.page').then((m) => m.TenantDetailPage),
        title: 'Tenant · Centaiva',
      },
      {
        path: 'access/roles',
        loadComponent: () => import('./features/access/roles.page').then((m) => m.RolesPage),
        title: 'Roles & Permissions · Centaiva',
      },
      {
        path: 'invitations',
        loadComponent: () => import('./features/invitations/invitations.page').then((m) => m.InvitationsPage),
        title: 'Invitations · Centaiva',
      },

      /* ---------------- Product catalog ---------------- */
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.page').then((m) => m.ProductsPage),
        title: 'Products · Centaiva',
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-detail.page').then((m) => m.ProductDetailPage),
        title: 'Product · Centaiva',
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/applications.page').then((m) => m.ApplicationsPage),
        title: 'Applications · Centaiva',
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/catalog/catalog.page').then((m) => m.CatalogPage),
        title: 'Product Catalog · Centaiva',
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/plans/plans.page').then((m) => m.PlansPage),
        title: 'Plans · Centaiva',
      },
      {
        path: 'plans/:id',
        loadComponent: () => import('./features/plans/plan-detail.page').then((m) => m.PlanDetailPage),
        title: 'Plan · Centaiva',
      },
      {
        path: 'entitlements',
        loadComponent: () => import('./features/entitlements/entitlements.page').then((m) => m.EntitlementsPage),
        title: 'Entitlements · Centaiva',
      },

      /* ---------------- Commercial ---------------- */
      {
        path: 'subscriptions',
        loadComponent: () => import('./features/subscriptions/subscriptions.page').then((m) => m.SubscriptionsPage),
        title: 'Subscriptions · Centaiva',
      },
      {
        path: 'subscriptions/:id',
        loadComponent: () =>
          import('./features/subscriptions/subscription-detail.page').then((m) => m.SubscriptionDetailPage),
        title: 'Subscription · Centaiva',
      },
      {
        path: 'licenses',
        loadComponent: () => import('./features/licenses/licenses.page').then((m) => m.LicensesPage),
        title: 'Licenses · Centaiva',
      },
      {
        path: 'licenses/:id',
        loadComponent: () => import('./features/licenses/license-detail.page').then((m) => m.LicenseDetailPage),
        title: 'License · Centaiva',
      },
      {
        path: 'license-pools',
        loadComponent: () => import('./features/license-pools/license-pools.page').then((m) => m.LicensePoolsPage),
        title: 'License Pools · Centaiva',
      },
      {
        path: 'usage',
        loadComponent: () => import('./features/usage/usage.page').then((m) => m.UsagePage),
        title: 'Usage & Quotas · Centaiva',
      },

      /* ---------------- Onboarding ---------------- */
      {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage),
        title: 'Customer Onboarding · Centaiva',
      },

      /* ---------------- Operations ---------------- */
      {
        path: 'provisioning',
        loadComponent: () => import('./features/provisioning/provisioning.page').then((m) => m.ProvisioningPage),
        title: 'Provisioning · Centaiva',
      },
      {
        path: 'deployments',
        loadComponent: () => import('./features/deployments/deployments.page').then((m) => m.DeploymentsPage),
        title: 'Deployments · Centaiva',
      },
      {
        path: 'data-stores',
        loadComponent: () => import('./features/data-stores/data-stores.page').then((m) => m.DataStoresPage),
        title: 'Data Stores · Centaiva',
      },
      {
        path: 'integrations',
        loadComponent: () => import('./features/integrations/integrations.page').then((m) => m.IntegrationsPage),
        title: 'Integrations · Centaiva',
      },

      /* ---------------- Security ---------------- */
      {
        path: 'security',
        loadComponent: () => import('./features/security/security.page').then((m) => m.SecurityPage),
        title: 'Security · Centaiva',
      },
      {
        path: 'security/identity-providers',
        loadComponent: () =>
          import('./features/security/identity-providers.page').then((m) => m.IdentityProvidersPage),
        title: 'Identity Providers · Centaiva',
      },
      {
        path: 'service-accounts',
        loadComponent: () =>
          import('./features/service-accounts/service-accounts.page').then((m) => m.ServiceAccountsPage),
        title: 'Service Accounts · Centaiva',
      },
      {
        path: 'feature-flags',
        loadComponent: () => import('./features/feature-flags/feature-flags.page').then((m) => m.FeatureFlagsPage),
        title: 'Feature Flags · Centaiva',
      },

      /* ---------------- System ---------------- */
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit.page').then((m) => m.AuditPage),
        title: 'Audit Logs · Centaiva',
      },
      {
        path: 'system/regions',
        loadComponent: () => import('./features/system/regions.page').then((m) => m.RegionsPage),
        title: 'Regions & Environments · Centaiva',
      },
      {
        path: 'system/diagnostics',
        loadComponent: () => import('./features/system/diagnostics.page').then((m) => m.DiagnosticsPage),
        title: 'Diagnostics · Centaiva',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage),
        title: 'Settings · Centaiva',
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
