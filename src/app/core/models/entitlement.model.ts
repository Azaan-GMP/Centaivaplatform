import { ValueType } from './common.model';

export type EntitlementStatus = 'Active' | 'Draft' | 'Deprecated';

export type EntitlementType = 'Feature Toggle' | 'Quota' | 'Limit' | 'Configuration';

export interface Entitlement {
  id: string;
  name: string;
  key: string;
  productKey: string;
  productName: string;
  type: EntitlementType;
  valueType: ValueType;
  defaultValue: string;
  unit: string | null;
  status: EntitlementStatus;
  description: string;
  planCount: number;
  createdAt: string;
}
