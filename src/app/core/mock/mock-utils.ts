import { Observable, delay, of } from 'rxjs';
import { ListQuery, PagedResult } from '../models';

/** Simulated network latency so loading states are exercised in the UI. */
export const MOCK_LATENCY_MS = 180;

export function respond<T>(value: T, latency = MOCK_LATENCY_MS): Observable<T> {
  return of(value).pipe(delay(latency));
}

/** Deterministic pseudo-random generator so mock data is stable between reloads. */
export function seeded(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function pick<T>(items: readonly T[], rnd: () => number): T {
  return items[Math.floor(rnd() * items.length)]!;
}

export function intBetween(min: number, max: number, rnd: () => number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

/** ISO timestamp offset a number of minutes into the past from a fixed reference. */
export const REFERENCE_NOW = new Date('2026-08-21T09:40:00.000Z');

export function minutesAgo(minutes: number): string {
  return new Date(REFERENCE_NOW.getTime() - minutes * 60_000).toISOString();
}

export function daysAgo(days: number): string {
  return minutesAgo(days * 24 * 60);
}

export function daysAhead(days: number): string {
  return new Date(REFERENCE_NOW.getTime() + days * 24 * 60 * 60_000).toISOString();
}

function readField(row: unknown, field: string): unknown {
  return field.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
}

function matchesSearch(row: unknown, search: string, fields: string[]): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return fields.some((field) => {
    const value = readField(row, field);
    return value != null && String(value).toLowerCase().includes(needle);
  });
}

/**
 * In-memory querying that mirrors what the future API will do server-side, so
 * page components can keep exactly the same call signature after integration.
 */
export function queryCollection<T extends object>(
  source: readonly T[],
  query: ListQuery | undefined,
  searchFields: string[],
): PagedResult<T> {
  let rows = [...source];

  if (query?.search) {
    rows = rows.filter((row) => matchesSearch(row, query.search!, searchFields));
  }

  const filters = query?.filters ?? {};
  for (const [field, expected] of Object.entries(filters)) {
    if (expected === null || expected === undefined || expected === '') {
      continue;
    }
    rows = rows.filter((row) => {
      const actual = readField(row, field);
      if (Array.isArray(actual)) {
        return actual.map(String).includes(String(expected));
      }
      return String(actual) === String(expected);
    });
  }

  if (query?.sortField) {
    const field = query.sortField;
    const order = query.sortOrder ?? 1;
    rows.sort((a, b) => {
      const left = readField(a, field);
      const right = readField(b, field);
      if (left === right) return 0;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * order;
      }
      return String(left).localeCompare(String(right)) * order;
    });
  }

  const total = rows.length;
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? (total || 1);
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value);
}
