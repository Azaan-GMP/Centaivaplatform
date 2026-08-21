import { Severity } from '../core/models';

/**
 * Single source of truth for status → colour mapping so every badge in the
 * console reads consistently, whatever domain it came from.
 */
const SEVERITY_BY_STATUS: Record<string, Severity> = {
  // Positive
  active: 'success',
  enabled: 'success',
  healthy: 'success',
  completed: 'success',
  connected: 'success',
  accepted: 'success',
  published: 'success',
  assigned: 'success',
  current: 'success',
  verified: 'success',
  granted: 'success',
  ga: 'success',
  resolved: 'success',
  success: 'success',

  // In flight
  provisioning: 'info',
  running: 'info',
  migrating: 'info',
  pending: 'info',
  invited: 'info',
  trial: 'info',
  preview: 'info',
  reserved: 'info',
  acknowledged: 'info',
  available: 'info',

  // Attention
  warning: 'warning',
  degraded: 'warning',
  'past due': 'warning',
  approaching: 'warning',
  expiring: 'warning',
  stale: 'warning',
  maintenance: 'warning',
  beta: 'warning',
  draft: 'warning',
  suspended: 'warning',
  sunset: 'warning',
  medium: 'warning',

  // Problems
  failed: 'danger',
  failure: 'danger',
  error: 'danger',
  offline: 'danger',
  expired: 'danger',
  revoked: 'danger',
  denied: 'danger',
  exceeded: 'danger',
  disabled: 'danger',
  cancelled: 'danger',
  critical: 'danger',
  high: 'danger',

  // Neutral
  archived: 'neutral',
  deprecated: 'neutral',
  retired: 'neutral',
  superseded: 'neutral',
  'rolled back': 'neutral',
  released: 'neutral',
  unlimited: 'neutral',
  low: 'neutral',
  'no change': 'neutral',

  // Scope badges
  platform: 'purple',
  organization: 'primary',
  tenant: 'info',
  application: 'neutral',
};

export function severityForStatus(status: string | null | undefined): Severity {
  if (!status) {
    return 'neutral';
  }
  return SEVERITY_BY_STATUS[status.toLowerCase().trim()] ?? 'neutral';
}

/** Traffic-light colour for a 0–100 utilisation figure. */
export function severityForUtilization(percent: number): Severity {
  if (percent >= 95) return 'danger';
  if (percent >= 80) return 'warning';
  return 'success';
}

/** Deterministic avatar colour so the same entity always gets the same tone. */
const AVATAR_PALETTE = ['#1a73e8', '#34a853', '#7c3aed', '#0891b2', '#f59e0b', '#dc2626', '#0f766e', '#be185d', '#4f46e5', '#b45309'];

export function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100_000;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!;
}

export function initialsFor(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}
