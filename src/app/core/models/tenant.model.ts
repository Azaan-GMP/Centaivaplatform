import { EnvironmentName, RegionName } from './common.model';

export type TenantStatus = 'Active' | 'Provisioning' | 'Suspended' | 'Archived';

export interface TenantMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  products: string[];
  status: 'Active' | 'Invited' | 'Disabled';
  lastActiveAt: string;
}

export interface TenantProduct {
  productKey: string;
  productName: string;
  planName: string;
  subscriptionId: string;
  status: string;
  activatedAt: string;
  seats: number;
  seatsUsed: number;
}

export interface TenantDataRoute {
  productKey: string;
  productName: string;
  environment: EnvironmentName;
  deploymentId: string;
  deploymentName: string;
  dataStoreId: string;
  dataStoreName: string;
  region: RegionName;
}

export interface TenantSecurityPolicy {
  requireMfa: boolean;
  allowPasswordLogin: boolean;
  allowExternalIdentityProviders: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  minimumPasswordLength: number;
  requireVerifiedEmail: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  key: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  region: RegionName;
  environment: EnvironmentName;
  status: TenantStatus;
  createdAt: string;
  memberCount: number;
  productKeys: string[];
  subscriptionStatus: string;
  licenseSeats: number;
  licenseSeatsUsed: number;
  storageUsedGb: number;
  storageQuotaGb: number;
  members: TenantMember[];
  products: TenantProduct[];
  dataRoutes: TenantDataRoute[];
  securityPolicy: TenantSecurityPolicy;
  primaryContact: string;
}
