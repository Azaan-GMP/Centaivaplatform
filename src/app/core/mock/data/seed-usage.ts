import { QuotaRecord, QuotaStatus, UsageSeriesPoint, UsageSummary } from '../../models';
import { daysAhead, intBetween, seeded } from '../mock-utils';
import { PRODUCTS } from './seed-catalog';
import { TENANTS } from './seed-tenants';

const METER_DEFINITIONS: { key: string; name: string; unit: string; productKey: string; period: QuotaRecord['period']; base: number }[] = [
  { key: 'API_CALLS', name: 'API Calls', unit: 'calls', productKey: 'WORKWELL_TIMESHEETS', period: 'Monthly', base: 250_000 },
  { key: 'AI_EXTRACTIONS', name: 'AI Extractions', unit: 'extractions', productKey: 'CENTAIVA_AI', period: 'Monthly', base: 12_000 },
  { key: 'DOCUMENTS_PROCESSED', name: 'Documents Processed', unit: 'documents', productKey: 'CENTAIVA_AI', period: 'Monthly', base: 40_000 },
  { key: 'STORAGE_USED', name: 'Storage Used', unit: 'GB', productKey: 'WORKWELL_FINANCE', period: 'Annual', base: 500 },
  { key: 'TIMESHEET_SUBMISSIONS', name: 'Timesheet Submissions', unit: 'submissions', productKey: 'WORKWELL_TIMESHEETS', period: 'Monthly', base: 60_000 },
  { key: 'ACTIVE_USERS', name: 'Active Users', unit: 'users', productKey: 'CENTAIVA_PLATFORM', period: 'Monthly', base: 400 },
  { key: 'INVOICES_PROCESSED', name: 'Invoices Processed', unit: 'invoices', productKey: 'WORKWELL_FINANCE', period: 'Monthly', base: 20_000 },
  { key: 'COMPLIANCE_RECORDS', name: 'Compliance Records', unit: 'records', productKey: 'MEDPURE', period: 'Monthly', base: 8_000 },
];

function statusFor(used: number, limit: number): QuotaStatus {
  if (limit <= 0) return 'Unlimited';
  const ratio = used / limit;
  if (ratio >= 1) return 'Exceeded';
  if (ratio >= 0.8) return 'Approaching';
  return 'Healthy';
}

function buildQuotas(): QuotaRecord[] {
  const rnd = seeded(6161);
  const rows: QuotaRecord[] = [];

  TENANTS.forEach((tenant, tenantIndex) => {
    const meters = METER_DEFINITIONS.filter(
      (meter) => tenant.productKeys.includes(meter.productKey) || meter.productKey === 'CENTAIVA_PLATFORM',
    );

    meters.forEach((meter, meterIndex) => {
      const scale = 0.25 + rnd() * 1.1;
      const limit = Math.round(meter.base * scale);
      const used = Math.round(limit * (0.1 + rnd() * 1.05));
      const reserved = Math.round(limit * rnd() * 0.06);
      const available = Math.max(0, limit - used - reserved);
      const product = PRODUCTS.find((p) => p.key === meter.productKey)!;

      rows.push({
        id: `qta-${tenant.id}-${meter.key.toLowerCase()}`,
        meterKey: meter.key,
        meterName: meter.name,
        tenantId: tenant.id,
        tenantName: tenant.name,
        productKey: meter.productKey,
        productName: product.name,
        unit: meter.unit,
        limit,
        used,
        reserved,
        available,
        resetAt: daysAhead(intBetween(1, 30, rnd)),
        period: meter.period,
        status: (tenantIndex + meterIndex) % 23 === 0 ? 'Unlimited' : statusFor(used, limit),
      });
    });
  });

  return rows;
}

export const QUOTAS: QuotaRecord[] = buildQuotas();

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

function buildSeries(seed: number): UsageSeriesPoint[] {
  const rnd = seeded(seed);
  let apiCalls = 640_000;
  let aiExtractions = 18_000;
  let documents = 52_000;

  return MONTHS.map((label) => {
    apiCalls = Math.round(apiCalls * (1.02 + rnd() * 0.09));
    aiExtractions = Math.round(aiExtractions * (1.03 + rnd() * 0.12));
    documents = Math.round(documents * (1.01 + rnd() * 0.08));
    return { label, apiCalls, aiExtractions, documents };
  });
}

export function usageSummaryFor(tenantId?: string, productKey?: string): UsageSummary {
  const scope = `${tenantId ?? 'all'}:${productKey ?? 'all'}`;
  const seed = [...scope].reduce((total, char) => total + char.charCodeAt(0), 17);
  const series = buildSeries(seed);
  const latest = series[series.length - 1]!;
  const previous = series[series.length - 2]!;

  const scopedQuotas = QUOTAS.filter(
    (quota) => (!tenantId || quota.tenantId === tenantId) && (!productKey || quota.productKey === productKey),
  );

  const storageGb = scopedQuotas
    .filter((quota) => quota.meterKey === 'STORAGE_USED')
    .reduce((total, quota) => total + quota.used, 0);

  const activeUsers = scopedQuotas
    .filter((quota) => quota.meterKey === 'ACTIVE_USERS')
    .reduce((total, quota) => total + quota.used, 0);

  const trend = (current: number, prior: number): number => Number((((current - prior) / prior) * 100).toFixed(1));

  return {
    apiCalls: latest.apiCalls,
    aiExtractions: latest.aiExtractions,
    documentsProcessed: latest.documents,
    storageGb: storageGb || 1_284,
    activeUsers: activeUsers || 2_418,
    apiCallsTrend: trend(latest.apiCalls, previous.apiCalls),
    aiExtractionsTrend: trend(latest.aiExtractions, previous.aiExtractions),
    documentsTrend: trend(latest.documents, previous.documents),
    storageTrend: 6.4,
    activeUsersTrend: 12.4,
    series,
  };
}
