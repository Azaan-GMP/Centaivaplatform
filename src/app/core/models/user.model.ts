import { EnvironmentName } from './common.model';

export type UserStatus = 'Active' | 'Disabled' | 'Invited' | 'Suspended';

export type MfaStatus = 'Enabled' | 'Disabled' | 'Enforced' | 'Pending';

export interface UserMembership {
  id: string;
  name: string;
  key: string;
  role: string;
  joinedAt: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  startedAt: string;
  lastActiveAt: string;
  current: boolean;
}

export interface UserSecurityEvent {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
  outcome: 'Success' | 'Failure';
}

export interface PlatformUser {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  jobTitle: string;
  status: UserStatus;
  mfa: MfaStatus;
  emailVerified: boolean;
  organizationIds: string[];
  tenantIds: string[];
  productKeys: string[];
  roleIds: string[];
  primaryRole: string;
  locale: string;
  timeZone: string;
  createdAt: string;
  lastSignInAt: string | null;
  lastSignInIp?: string;
  avatarColor: string;
  organizations: UserMembership[];
  tenants: UserMembership[];
  sessions: UserSession[];
  securityEvents: UserSecurityEvent[];
  defaultEnvironment: EnvironmentName;
}

export interface UserEffectiveAccess {
  roles: string[];
  permissions: string[];
  entitlements: Array<{ key: string; value: string }>;
  hasApplicationAccess: boolean;
  isPlatformOwner: boolean;
  isTenantAdmin: boolean;
}
