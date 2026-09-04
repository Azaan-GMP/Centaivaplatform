import { Routes } from '@angular/router';

export const childRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../components/dashboard/dashboard-routing.module').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('../components/organizations/organizations.component').then(m => m.OrganizationsComponent),
  },
  {
    path: 'tenants',
    loadComponent: () =>
      import('../components/tenants/tenants.component').then(m => m.TenantsComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('../components/users/users.component').then(m => m.UsersComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('../components/products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'applications',
    loadComponent: () =>
      import('../components/applications/applications.component').then(m => m.ApplicationsComponent),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('../components/roles/roles.component').then(m => m.RolesComponent),
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('../components/permissions/permissions.component').then(m => m.PermissionsComponent),
  },
  {
    path: 'integrations',
    loadComponent: () =>
      import('../components/integrations/integrations.component').then(m => m.IntegrationsComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('../components/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: 'audit',
    loadComponent: () =>
      import('../components/audit/audit.component').then(m => m.AuditComponent),
  }
];
