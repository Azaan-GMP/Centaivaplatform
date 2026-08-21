import { RegionName } from './common.model';

export type OrganizationType =
  | 'Platform'
  | 'Vendor'
  | 'Partner'
  | 'Reseller'
  | 'Customer'
  | 'Division'
  | 'Region';

export type OrganizationStatus = 'Active' | 'Suspended' | 'Archived' | 'Pending';

export interface OrganizationMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Disabled';
  addedAt: string;
}

export interface OrganizationCommercial {
  billingAccount: string;
  currency: string;
  paymentTerms: string;
  contractStart: string;
  contractEnd: string;
  annualValue: number;
  invoiceEmail: string;
}

export interface Organization {
  id: string;
  name: string;
  key: string;
  slug: string;
  type: OrganizationType;
  parentId: string | null;
  /** Materialised ancestry path, root first. Depth is unbounded by design. */
  path: string[];
  region: RegionName;
  timeZone: string;
  status: OrganizationStatus;
  createdAt: string;
  description: string;
  tenantCount: number;
  memberCount: number;
  childCount: number;
  licenseSeats: number;
  licenseSeatsUsed: number;
  ownerName: string;
  ownerEmail: string;
  commercial: OrganizationCommercial;
  members: OrganizationMember[];
}

/** Recursive view model used by the organization tree. */
export interface OrganizationNode {
  organization: Organization;
  children: OrganizationNode[];
  depth: number;
}
