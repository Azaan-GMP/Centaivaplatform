export type RoleScope = 'Platform' | 'Organization' | 'Tenant' | 'Application';

export type RoleStatus = 'Active' | 'Draft' | 'Deprecated';

export interface RolePermissionGrant {
  permissionKey: string;
  permissionName: string;
  module: string;
  feature: string;
  granted: boolean;
}

export interface RoleAssignment {
  id: string;
  principalName: string;
  principalEmail: string;
  principalType: 'User' | 'Service Account' | 'Group';
  scopeName: string;
  scopeType: RoleScope;
  assignedAt: string;
  assignedBy: string;
}

export interface Role {
  id: string;
  name: string;
  key: string;
  description: string;
  scope: RoleScope;
  applicationName: string;
  applicationKey: string | null;
  productKey: string | null;
  system: boolean;
  status: RoleStatus;
  permissionCount: number;
  assignmentCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermissionGrant[];
  assignments: RoleAssignment[];
}
