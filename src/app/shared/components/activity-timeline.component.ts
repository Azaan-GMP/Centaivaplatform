import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TimelineEntry } from '../../core/models';

@Component({
  selector: 'ctv-activity-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <ol class="timeline">
      @for (entry of entries(); track entry.id; let last = $last) {
        <li class="timeline__item" [class.timeline__item--last]="last">
          <span class="timeline__marker" [class]="'timeline__marker--' + entry.status">
            @switch (entry.status) {
              @case ('complete') { <i class="pi pi-check" aria-hidden="true"></i> }
              @case ('failed') { <i class="pi pi-times" aria-hidden="true"></i> }
              @case ('active') { <i class="pi pi-spinner timeline__spin" aria-hidden="true"></i> }
              @default { <span class="timeline__dot"></span> }
            }
          </span>

          <div class="timeline__body">
            <div class="timeline__head">
              <span class="timeline__title">{{ entry.title }}</span>
              @if (entry.durationMs) {
                <span class="timeline__meta">{{ duration(entry.durationMs) }}</span>
              } @else if (entry.status === 'active') {
                <span class="timeline__meta timeline__meta--active">In progress</span>
              } @else if (entry.status === 'pending') {
                <span class="timeline__meta">Pending</span>
              }
            </div>
            @if (entry.description) {
              <p class="timeline__desc">{{ entry.description }}</p>
            }
            @if (showTimestamps() && entry.status !== 'pending') {
              <span class="timeline__time">
                {{ entry.timestamp | date: 'dd MMM yyyy, HH:mm' }}
                @if (entry.actor) {
                  · {{ entry.actor }}
                }
              </span>
            }
          </div>
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .timeline { display: flex; flex-direction: column; }
      .timeline__item {
        position: relative;
        display: grid;
        grid-template-columns: 22px minmax(0, 1fr);
        gap: var(--space-3);
        padding-bottom: var(--space-4);
      }
      .timeline__item:not(.timeline__item--last)::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 22px;
        bottom: 0;
        width: 1.5px;
        background: var(--border-default);
      }
      .timeline__marker {
        position: relative;
        z-index: 1;
        width: 21px;
        height: 21px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        border: 1.5px solid var(--border-default);
        background: var(--surface-card);
        color: var(--text-tertiary);
      }
      .timeline__marker--complete {
        background: var(--color-success);
        border-color: var(--color-success);
        color: #fff;
      }
      .timeline__marker--failed {
        background: var(--color-danger);
        border-color: var(--color-danger);
        color: #fff;
      }
      .timeline__marker--active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
      }
      .timeline__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--text-tertiary); }
      .timeline__spin { animation: ctv-rotate 1.1s linear infinite; }
      @keyframes ctv-rotate { to { transform: rotate(360deg); } }
      .timeline__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-top: 1px; }
      .timeline__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-3);
      }
      .timeline__title { font-size: var(--fs-base); font-weight: 600; }
      .timeline__meta { font-size: var(--fs-sm); color: var(--text-tertiary); white-space: nowrap; }
      .timeline__meta--active { color: var(--color-primary); font-weight: 600; }
      .timeline__desc { font-size: var(--fs-sm); color: var(--text-secondary); }
      .timeline__time { font-size: var(--fs-xs); color: var(--text-tertiary); }
    `,
  ],
})
export class ActivityTimelineComponent {
  readonly entries = input.required<TimelineEntry[]>();
  readonly showTimestamps = input(true);

  duration(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.round((ms % 60_000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}
