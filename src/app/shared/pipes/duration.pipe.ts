import { Pipe, PipeTransform } from '@angular/core';

/** Formats a millisecond duration for provisioning and deployment views. */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    if (ms === null || ms === undefined || ms <= 0) {
      return '—';
    }
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;

    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.round((ms % 60_000) / 1000);
    if (minutes < 60) return `${minutes}m ${seconds}s`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
}
