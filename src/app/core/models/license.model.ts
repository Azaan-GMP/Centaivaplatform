import { EnvironmentName } from './common.model';

export type LicenseStatus = 'Active' | 'Suspended' | 'Expired' | 'Revoked' | 'Pending';

export type LicenseType = 'Named User' | 'Concurrent' | 'Site' | 'Trial' | 'Device';

export interface LicenseSeat {
  id: string;
  userId: string;
  userName: string;
  email: string;
  assignedAt: string;
  lastActiveAt: string;
  status: 'Assigned' | 'Reserved' | 'Released';
  device: string;
}

export interface LicenseActivation {
  id: string;
  machineName: string;
  fingerprint: string;
  user: string;
  ipAddress: string;
  environment: EnvironmentName;
  activatedAt: string;
  lastHeartbeat: string;
  status: 'Active' | 'Stale' | 'Revoked';
}

export interface ConcurrentLease {
  id: string;
  user: string;
  sessionId: string;
  acquiredAt: string;
  expiresAt: string;
  application: string;
}

export interface LicenseLimit {
  name: string;
  key: string;
  limit: string;
  used: string;
  utilization: number;
}

export interface LicenseHistoryEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  detail: string;
}

export interface License {
  id: string;
  reference: string;
  maskedKey: string;
  tenantId: string;
  tenantName: string;
  organizationName: string;
  productKey: string;
  productName: string;
  subscriptionId: string;
  type: LicenseType;
  status: LicenseStatus;
  seatLimit: number;
  seatsUsed: number;
  activationLimit: number;
  activationCount: number;
  concurrentLimit: number;
  concurrentActive: number;
  issuedAt: string;
  expiresAt: string;
  poolId: string | null;
  seats: LicenseSeat[];
  activations: LicenseActivation[];
  leases: ConcurrentLease[];
  limits: LicenseLimit[];
  history: LicenseHistoryEntry[];
}

export type LicensePoolStatus = 'Active' | 'Exhausted' | 'Suspended';

export interface LicensePool {
  id: string;
  name: string;
  ownerOrganizationId: string;
  ownerName: string;
  parentPoolId: string | null;
  productKey: string;
  productName: string;
  totalSeats: number;
  allocatedSeats: number;
  availableSeats: number;
  childPoolCount: number;
  status: LicensePoolStatus;
  createdAt: string;
  depth: number;
}
