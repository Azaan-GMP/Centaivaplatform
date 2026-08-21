/**
 * Shared primitives used across every Centaiva Platform domain model.
 */

export type Severity = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'purple' | 'neutral';

export type HealthStatus = 'Healthy' | 'Warning' | 'Offline' | 'Degraded';

export type EnvironmentName = 'Development' | 'QA' | 'Staging' | 'Production';

export type RegionCode = 'uk-south' | 'uk-west' | 'eu-west' | 'us-east';

export type RegionName = 'UK South' | 'UK West' | 'EU West' | 'US East';

export type ValueType = 'Boolean' | 'Integer' | 'Decimal' | 'String';

/** Generic option shape used by every select / filter in the UI. */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: string;
  description?: string;
}

/** Standard list envelope so mock services and future API services agree on shape. */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Query passed into list endpoints. */
export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 1 | -1;
  filters?: Record<string, string | number | boolean | null | undefined>;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  trend?: number;
  trendLabel?: string;
  icon: string;
  accent?: Severity;
  series?: number[];
  footnote?: string;
}

export interface HealthSignal {
  id: string;
  name: string;
  status: HealthStatus;
  detail: string;
  latencyMs?: number;
  lastChecked: string;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  actor?: string;
  durationMs?: number;
}
