import { Pipe, PipeTransform } from '@angular/core';

/** Human friendly "3 min ago" formatting used across activity and audit views. */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '—';
    }

    const then = value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (Number.isNaN(then)) {
      return '—';
    }

    const diffMinutes = Math.round((Date.now() - then) / 60_000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return `${hours} h ago`;

    const days = Math.round(hours / 24);
    if (days < 30) return `${days} d ago`;

    const months = Math.round(days / 30);
    if (months < 12) return `${months} mo ago`;

    return `${Math.round(months / 12)} y ago`;
  }
}
