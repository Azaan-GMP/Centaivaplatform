import { ValueType } from './common.model';

export type PlanStatus = 'Active' | 'Draft' | 'Retired';

export type PlanVersionStatus = 'Draft' | 'Published' | 'Retired';

export interface PlanEntitlementValue {
  entitlementKey: string;
  entitlementName: string;
  valueType: ValueType;
  value: string;
  unlimited: boolean;
}

export interface PlanVersion {
  id: string;
  version: string;
  status: PlanVersionStatus;
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
  notes: string;
  subscriptionCount: number;
}

export interface Plan {
  id: string;
  name: string;
  key: string;
  productKey: string;
  productName: string;
  description: string;
  tier: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  currentVersion: string;
  status: PlanStatus;
  baseSeats: number;
  pricePerSeat: number;
  billingCycle: 'Monthly' | 'Annual';
  currency: string;
  subscriptionCount: number;
  createdAt: string;
  highlights: string[];
  versions: PlanVersion[];
  entitlements: PlanEntitlementValue[];
}
