export type QuotaStatus = 'Healthy' | 'Approaching' | 'Exceeded' | 'Unlimited';

export interface QuotaRecord {
  id: string;
  meterKey: string;
  meterName: string;
  tenantId: string;
  tenantName: string;
  productKey: string;
  productName: string;
  unit: string;
  limit: number;
  used: number;
  reserved: number;
  available: number;
  resetAt: string;
  period: 'Daily' | 'Monthly' | 'Annual';
  status: QuotaStatus;
}

export interface UsageSeriesPoint {
  label: string;
  apiCalls: number;
  aiExtractions: number;
  documents: number;
}

export interface UsageSummary {
  apiCalls: number;
  aiExtractions: number;
  documentsProcessed: number;
  storageGb: number;
  activeUsers: number;
  apiCallsTrend: number;
  aiExtractionsTrend: number;
  documentsTrend: number;
  storageTrend: number;
  activeUsersTrend: number;
  series: UsageSeriesPoint[];
}
