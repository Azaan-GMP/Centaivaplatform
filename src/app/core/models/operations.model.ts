import { EnvironmentName, HealthStatus, RegionName, TimelineEntry } from './common.model';

/* ---------------- Provisioning ---------------- */

export type ProvisioningStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface ProvisioningRun {
  id: string;
  tenantId: string;
  tenantName: string;
  productKey: string;
  productName: string;
  templateId: string;
  templateName: string;
  environment: EnvironmentName;
  status: ProvisioningStatus;
  startedAt: string;
  durationMs: number;
  triggeredBy: string;
  steps: TimelineEntry[];
}

export interface ProvisioningTemplate {
  id: string;
  name: string;
  key: string;
  productKey: string;
  productName: string;
  version: string;
  stepCount: number;
  runCount: number;
  status: 'Active' | 'Draft' | 'Deprecated';
  updatedAt: string;
  description: string;
}

/* ---------------- Deployments ---------------- */

export type DeploymentStatus = 'Healthy' | 'Degraded' | 'Offline' | 'Maintenance';

export interface DeploymentRelease {
  id: string;
  version: string;
  releasedAt: string;
  releasedBy: string;
  notes: string;
  status: 'Current' | 'Superseded' | 'Rolled Back';
}

export interface Deployment {
  id: string;
  name: string;
  productKey: string;
  productName: string;
  region: RegionName;
  environment: EnvironmentName;
  baseUrl: string;
  version: string;
  tenantCount: number;
  status: DeploymentStatus;
  uptimePercent: number;
  latencyMs: number;
  dataStoreId: string;
  dataStoreName: string;
  lastReleasedAt: string;
  releases: DeploymentRelease[];
}

/* ---------------- Data stores ---------------- */

export type DataStoreProvider = 'Azure SQL' | 'PostgreSQL' | 'Azure Blob' | 'Cosmos DB' | 'Redis';

export interface DataStoreRoute {
  tenantId: string;
  tenantName: string;
  productName: string;
  environment: EnvironmentName;
  schema: string;
  status: 'Active' | 'Migrating' | 'Suspended';
}

export interface DataStore {
  id: string;
  name: string;
  provider: DataStoreProvider;
  server: string;
  database: string;
  region: RegionName;
  environment: EnvironmentName;
  tenantCount: number;
  status: HealthStatus;
  sizeGb: number;
  capacityGb: number;
  connectionMasked: string;
  lastBackupAt: string;
  routes: DataStoreRoute[];
  products: string[];
}

/* ---------------- Integrations ---------------- */

export type IntegrationCategory = 'Accounting' | 'Productivity' | 'Messaging' | 'Storage' | 'Automation' | 'Time Tracking';

export interface IntegrationProvider {
  id: string;
  name: string;
  key: string;
  category: IntegrationCategory;
  protocol: string;
  status: 'Connected' | 'Available' | 'Error' | 'Disabled';
  configuredTenants: number;
  description: string;
  accent: string;
  icon: string;
}

export interface TenantIntegration {
  id: string;
  tenantId: string;
  tenantName: string;
  providerKey: string;
  providerName: string;
  productName: string;
  environment: EnvironmentName;
  status: 'Connected' | 'Error' | 'Pending' | 'Disabled';
  lastSyncAt: string;
  syncedRecords: number;
  connectionMasked: string;
}

/* ---------------- Regions and environments ---------------- */

export interface PlatformRegion {
  id: string;
  name: RegionName;
  code: string;
  location: string;
  status: HealthStatus;
  deploymentCount: number;
  productCount: number;
  tenantCount: number;
  dataResidency: string;
  latencyMs: number;
}

export interface PlatformEnvironment {
  id: string;
  name: EnvironmentName;
  key: string;
  status: HealthStatus;
  deploymentCount: number;
  productCount: number;
  tenantCount: number;
  description: string;
  protectedEnvironment: boolean;
}
