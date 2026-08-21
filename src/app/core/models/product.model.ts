export type ProductStatus = 'Active' | 'Beta' | 'Deprecated' | 'Draft';

export type LifecycleStage = 'GA' | 'Beta' | 'Preview' | 'Sunset';

export interface ProductMeter {
  id: string;
  name: string;
  key: string;
  unit: string;
  aggregation: 'Sum' | 'Max' | 'Average' | 'Unique';
  resetPeriod: 'Daily' | 'Monthly' | 'Annual' | 'Never';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  key: string;
  description: string;
  status: ProductStatus;
  lifecycle: LifecycleStage;
  version: string;
  owner: string;
  iconAccent: string;
  applicationCount: number;
  moduleCount: number;
  featureCount: number;
  permissionCount: number;
  tenantCount: number;
  subscriptionCount: number;
  activeUsers: number;
  createdAt: string;
  meters: ProductMeter[];
}
