import { EnvironmentName } from './common.model';

/* ---------------- Identity providers ---------------- */

export type IdpProtocol = 'OpenID Connect' | 'SAML 2.0' | 'OAuth 2.0' | 'WS-Federation';

export interface IdentityProvider {
  id: string;
  name: string;
  key: string;
  protocol: IdpProtocol;
  tenantName: string;
  tenantId: string | null;
  domains: string[];
  status: 'Enabled' | 'Disabled' | 'Error' | 'Pending';
  issuer: string;
  clientId: string;
  clientSecretMasked: string;
  scopes: string[];
  userCount: number;
  updatedAt: string;
  accent: string;
  icon: string;
}

/* ---------------- Service accounts ---------------- */

export interface ServiceAccountCredential {
  id: string;
  name: string;
  type: 'Client Secret' | 'Certificate';
  maskedValue: string;
  createdAt: string;
  expiresAt: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Revoked';
}

export interface ServiceAccount {
  id: string;
  name: string;
  clientId: string;
  applicationName: string;
  applicationKey: string;
  tenantName: string;
  tenantId: string | null;
  description: string;
  status: 'Active' | 'Disabled' | 'Expired';
  lastUsedAt: string;
  createdAt: string;
  scopes: string[];
  credentials: ServiceAccountCredential[];
}

/* ---------------- Feature flags ---------------- */

export interface FlagOverride {
  id: string;
  scopeType: 'Organization' | 'Tenant' | 'User' | 'Environment';
  scopeName: string;
  value: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  applicationName: string;
  applicationKey: string;
  productName: string;
  description: string;
  defaultValue: boolean;
  status: 'Active' | 'Draft' | 'Archived';
  rolloutPercent: number;
  updatedAt: string;
  overrides: FlagOverride[];
}

/* ---------------- Security posture ---------------- */

export interface SecurityAlert {
  id: string;
  title: string;
  detail: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  raisedAt: string;
  tenantName: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
}

export interface AuthenticationPolicy {
  id: string;
  tenantId: string;
  tenantName: string;
  requireMfa: boolean;
  allowPasswordLogin: boolean;
  allowExternalIdentityProviders: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  minimumPasswordLength: number;
  requireVerifiedEmail: boolean;
  updatedAt: string;
}

export interface VerifiedDomain {
  id: string;
  domain: string;
  tenantName: string;
  verified: boolean;
  verificationMethod: 'DNS TXT' | 'HTML File' | 'Email';
  identityProvider: string;
  addedAt: string;
}

export interface ActiveSession {
  id: string;
  userName: string;
  email: string;
  tenantName: string;
  ipAddress: string;
  location: string;
  device: string;
  environment: EnvironmentName;
  startedAt: string;
  lastActiveAt: string;
  mfaSatisfied: boolean;
}

/* ---------------- Invitations ---------------- */

export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Revoked';

export interface Invitation {
  id: string;
  email: string;
  organizationName: string;
  organizationId: string;
  tenantName: string;
  tenantId: string | null;
  role: string;
  status: InvitationStatus;
  sentAt: string;
  expiresAt: string;
  invitedBy: string;
  message: string;
}
