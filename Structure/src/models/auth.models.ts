export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

export interface DecodedJwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string | string[];
  client_id?: string;
  tenant_id?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isPlatformOwner: boolean;
  tenantId?: string | null;
}

export interface PlatformContextMe {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    roles?: string[];
  };
  organization?: {
    id: string;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  application?: {
    id: string;
    key: string;
    name: string;
  };
  [key: string]: unknown;
}

export interface PlatformBootstrap {
  platformId?: string;
  name?: string;
  version?: string;
  environment?: string;
  user?: UserProfile;
  features?: Record<string, boolean>;
  navigation?: Array<{
    key: string;
    label: string;
    route: string;
    icon?: string;
    roles?: string[];
  }>;
  [key: string]: unknown;
}

export interface AdminScope {
  isPlatformOwner: boolean;
  canManageOrganizations: boolean;
  canManageTenants: boolean;
  canManageUsers: boolean;
  canManageRbac: boolean;
  canManageProducts: boolean;
  canManageIntegrations: boolean;
  canManageOnboarding: boolean;
  canManageFeatureFlags: boolean;
  canManageAudit: boolean;
  organizations?: string[];
  tenants?: string[];
  applications?: string[];
  permissions?: string[];
  raw?: unknown;
}
