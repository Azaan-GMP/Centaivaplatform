import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HealthSignal, PlatformEnvironment, PlatformRegion, TrendPoint } from '../models';
import { PlatformOverview, PlatformService } from '../services/data-contracts';
import { PLATFORM_ENVIRONMENTS, PLATFORM_REGIONS } from './data/seed-operations';
import { minutesAgo, respond } from './mock-utils';

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const TENANT_GROWTH: TrendPoint[] = [78, 84, 89, 93, 97, 101, 105, 109, 113, 118, 122, 126].map((value, index) => ({
  label: MONTHS[index]!,
  value,
}));

const USER_GROWTH: TrendPoint[] = [1210, 1348, 1462, 1591, 1684, 1790, 1878, 1996, 2104, 2218, 2321, 2418].map(
  (value, index) => ({ label: MONTHS[index]!, value }),
);

const SUBSCRIPTION_DISTRIBUTION: TrendPoint[] = [
  { label: 'Enterprise', value: 34 },
  { label: 'Business', value: 41 },
  { label: 'Professional', value: 28 },
  { label: 'Starter', value: 16 },
];

const LICENSE_UTILIZATION = [
  { label: 'WorkWell Timesheets', used: 1842, total: 2100 },
  { label: 'WorkWell Finance', used: 906, total: 1250 },
  { label: 'MedPure', used: 512, total: 640 },
  { label: 'Centaiva AI', used: 318, total: 900 },
  { label: 'Centaiva Identity', used: 264, total: 300 },
];

@Injectable({ providedIn: 'root' })
export class MockPlatformService extends PlatformService {
  overview(): Observable<PlatformOverview> {
    return respond<PlatformOverview>({
      kpis: [
        { id: 'organizations', label: 'Organizations', value: '48', rawValue: 48, trend: 4.8, trendLabel: 'vs last month', icon: 'pi pi-sitemap', accent: 'primary', series: [34, 36, 38, 39, 41, 43, 44, 46, 48] },
        { id: 'tenants', label: 'Tenants', value: '126', rawValue: 126, trend: 8.1, trendLabel: 'vs last month', icon: 'pi pi-building', accent: 'primary', series: [93, 97, 101, 105, 109, 113, 118, 122, 126] },
        { id: 'active-users', label: 'Active Users', value: '2,418', rawValue: 2418, trend: 12.4, trendLabel: 'vs last month', icon: 'pi pi-users', accent: 'success', series: [1684, 1790, 1878, 1996, 2104, 2218, 2321, 2380, 2418] },
        { id: 'products', label: 'Products', value: '6', rawValue: 6, trend: 0, trendLabel: 'no change', icon: 'pi pi-box', accent: 'neutral', series: [5, 5, 5, 5, 6, 6, 6, 6, 6] },
        { id: 'subscriptions', label: 'Active Subscriptions', value: '119', rawValue: 119, trend: 6.2, trendLabel: 'vs last month', icon: 'pi pi-credit-card', accent: 'primary', series: [88, 92, 96, 99, 104, 108, 112, 116, 119] },
        { id: 'licenses', label: 'Active Licenses', value: '3,842', rawValue: 3842, trend: 9.7, trendLabel: 'vs last month', icon: 'pi pi-id-card', accent: 'success', series: [2810, 2984, 3122, 3290, 3418, 3560, 3688, 3774, 3842] },
      ],
      health: [
        { id: 'authentication', name: 'Authentication', status: 'Healthy', detail: 'All identity providers responding', latencyMs: 42, lastChecked: minutesAgo(1) },
        { id: 'authorization', name: 'Authorization', status: 'Healthy', detail: 'Permission evaluation within target', latencyMs: 18, lastChecked: minutesAgo(1) },
        { id: 'licensing', name: 'Licensing', status: 'Healthy', detail: 'Seat and activation checks nominal', latencyMs: 27, lastChecked: minutesAgo(2) },
        { id: 'provisioning', name: 'Provisioning', status: 'Warning', detail: '2 Running', latencyMs: 96, lastChecked: minutesAgo(1) },
        { id: 'database', name: 'Database', status: 'Healthy', detail: '11 data stores online', latencyMs: 8, lastChecked: minutesAgo(1) },
        { id: 'integrations', name: 'Integrations', status: 'Warning', detail: '1 Warning — SendGrid delivery errors', latencyMs: 210, lastChecked: minutesAgo(3) },
      ],
      tenantGrowth: TENANT_GROWTH,
      userGrowth: USER_GROWTH,
      subscriptionDistribution: SUBSCRIPTION_DISTRIBUTION,
      licenseUtilization: LICENSE_UTILIZATION,
    });
  }

  regions(): Observable<PlatformRegion[]> {
    return respond([...PLATFORM_REGIONS]);
  }

  environments(): Observable<PlatformEnvironment[]> {
    return respond([...PLATFORM_ENVIRONMENTS]);
  }

  diagnostics(): Observable<HealthSignal[]> {
    return respond<HealthSignal[]>([
      { id: 'diag-api', name: 'Platform API', status: 'Healthy', detail: 'All control plane endpoints responding within SLO.', latencyMs: 46, lastChecked: minutesAgo(1) },
      { id: 'diag-identity-db', name: 'Identity Database', status: 'Healthy', detail: 'Primary and read replica in sync.', latencyMs: 7, lastChecked: minutesAgo(1) },
      { id: 'diag-authorization', name: 'Authorization', status: 'Healthy', detail: 'Permission cache hit ratio 98.4%.', latencyMs: 12, lastChecked: minutesAgo(2) },
      { id: 'diag-licensing', name: 'Licensing', status: 'Healthy', detail: 'Seat reconciliation completed 4 minutes ago.', latencyMs: 31, lastChecked: minutesAgo(4) },
      { id: 'diag-provisioning', name: 'Provisioning', status: 'Warning', detail: '2 runs in progress, 1 awaiting a data store slot.', latencyMs: 118, lastChecked: minutesAgo(1) },
      { id: 'diag-audit', name: 'Audit', status: 'Healthy', detail: 'Event ingestion lag under 2 seconds.', latencyMs: 24, lastChecked: minutesAgo(1) },
      { id: 'diag-messaging', name: 'Messaging', status: 'Warning', detail: 'Outbound queue depth 412 — SendGrid retries in progress.', latencyMs: 340, lastChecked: minutesAgo(2) },
      { id: 'diag-integrations', name: 'Integrations', status: 'Offline', detail: 'Helix Entra ID connector unreachable since 08:52 UTC.', latencyMs: 0, lastChecked: minutesAgo(3) },
    ]);
  }
}
