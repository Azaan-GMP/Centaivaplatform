import { Pipe, PipeTransform } from '@angular/core';

/** Compacts large counters so dense tables stay readable. */
@Pipe({ name: 'compactNumber' })
export class CompactNumberPipe implements PipeTransform {
  transform(value: number | null | undefined, precision = 1): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(precision)}B`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(precision)}M`;
    if (abs >= 10_000) return `${(value / 1000).toFixed(0)}k`;
    return new Intl.NumberFormat('en-GB').format(value);
  }
}
