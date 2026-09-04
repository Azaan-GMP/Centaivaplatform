export interface Organization {
  id: string;
  name: string;
  displayName?: string;
  code?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  createdAt?: string;
  updatedAt?: string;
  tenantCount?: number;
  description?: string;
  [key: string]: unknown;
}

export interface Tenant {
  id: string;
  name: string;
  identifier?: string;
  code?: string;
  organizationId?: string;
  organizationName?: string;
  parentTenantId?: string;
  parentTenantName?: string;
  isParentTenant?: boolean;
  hierarchyLevel?: number;
  subTenantsCount?: number;
  subTenants?: Tenant[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  description?: string;
  applications?: string[];
  mappedCompId?: number | string;
  [key: string]: unknown;
}

export interface TenantTreeNode extends Tenant {
  depth: number;
  subTenants: TenantTreeNode[];
  path: string[];
}

export interface TenantTableRow extends TenantTreeNode {
  hasChildren: boolean;
  isExpanded: boolean;
}

export interface TenantMember {
  id?: string;
  userId: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE' | string;
  joinedAt?: string;
  [key: string]: unknown;
}

export interface TenantInvitation {
  id: string;
  email: string;
  role?: string;
  invitedBy?: string;
  invitedAt?: string;
  expiresAt?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED' | string;
  [key: string]: unknown;
}

export interface PlatformUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING' | string;
  roles?: string[];
  isMfaEnabled?: boolean;
  mfaEnabled?: boolean;
  emailConfirmed?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  [key: string]: unknown;
}

export interface UserEffectiveAccess {
  userId: string;
  applicationKey: string;
  tenantId?: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  version?: string;
  [key: string]: unknown;
}

export interface Application {
  id: string;
  key: string;
  name: string;
  clientId: string;
  productId?: string;
  productName?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  description?: string;
  [key: string]: unknown;
}

export interface ApplicationModule {
  id: string;
  key: string;
  name: string;
  applicationId: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  featuresCount?: number;
  [key: string]: unknown;
}

export interface ApplicationFeature {
  id: string;
  key: string;
  name: string;
  moduleId?: string;
  applicationId: string;
  isEnabledByDefault?: boolean;
  status: 'ACTIVE' | 'INACTIVE' | string;
  [key: string]: unknown;
}

export interface Role {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  applicationId?: string;
  applicationKey?: string;
  tenantId?: string;
  isSystemRole?: boolean;
  permissions?: string[];
  [key: string]: unknown;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  module?: string;
  applicationId?: string;
  [key: string]: unknown;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  userEmail?: string;
  roleId: string;
  roleName?: string;
  organizationId?: string;
  tenantId?: string;
  applicationId?: string;
  assignedAt?: string;
  [key: string]: unknown;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  key: string;
  type: string;
  description?: string;
  iconUrl?: string;
  status: 'ACTIVE' | 'BETA' | string;
  [key: string]: unknown;
}

export interface Integration {
  id: string;
  providerId: string;
  providerName?: string;
  tenantId?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | string;
  configuredAt?: string;
  [key: string]: unknown;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  scope: 'GLOBAL' | 'TENANT' | 'ORGANIZATION' | string;
  environment?: string;
  [key: string]: unknown;
}

export interface ServiceAccount {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  roles?: string[];
  status: 'ACTIVE' | 'REVOKED' | string;
  createdAt?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE' | string;
  details?: Record<string, unknown> | string;
  [key: string]: unknown;
}

export interface WorkWellTenantSelectionResult {
  selectionCode: string;
  tenantId: string;
  expiresIn?: number;
}
