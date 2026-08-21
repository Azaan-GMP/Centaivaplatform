export type SubscriptionStatus = 'Active' | 'Trial' | 'Past Due' | 'Suspended' | 'Cancelled';

export interface SubscriptionUsageLine {
  meter: string;
  used: number;
  limit: number;
  unit: string;
}

export interface Subscription {
  id: string;
  reference: string;
  tenantId: string;
  tenantName: string;
  organizationName: string;
  productKey: string;
  productName: string;
  planId: string;
  planName: string;
  planVersion: string;
  status: SubscriptionStatus;
  seats: number;
  seatsUsed: number;
  periodStart: string;
  periodEnd: string;
  autoRenew: boolean;
  billingCycle: 'Monthly' | 'Annual';
  currency: string;
  amount: number;
  createdAt: string;
  trialEndsAt: string | null;
  licenseIds: string[];
  usage: SubscriptionUsageLine[];
}
