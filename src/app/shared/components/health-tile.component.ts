import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HealthSignal } from '../../core/models';
import { severityForStatus } from '../status.util';

@Component({
  selector: 'ctv-health-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="health" [class]="'health--' + severity()">
      <div class="health__row">
        <span class="health__name">{{ data().name }}</span>
        <span class="badge" [class]="'badge--' + severity()">
          <span class="badge__dot" aria-hidden="true"></span>
          {{ data().status }}
        </span>
      </div>
      <p class="health__detail u-truncate" [attr.title]="data().detail">{{ data().detail }}</p>
      <div class="health__meta">
        @if (data().latencyMs !== undefined && data().latencyMs !== 0) {
          <span>{{ data().latencyMs }} ms</span>
          <span class="divider--v" aria-hidden="true"></span>
        }
        <span>Checked {{ relative() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .health {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: var(--space-3) var(--space-4);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--surface-card);
        border-left-width: 3px;
      }
      .health--success { border-left-color: var(--color-success); }
      .health--warning { border-left-color: var(--color-warning); }
      .health--danger { border-left-color: var(--color-danger); }
      .health--neutral { border-left-color: var(--border-strong); }
      .health--info { border-left-color: var(--color-info); }
      .health--primary { border-left-color: var(--color-primary); }
      .health--purple { border-left-color: var(--color-purple); }
      .health__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
      }
      .health__name { font-size: var(--fs-base); font-weight: 600; }
      .health__detail { font-size: var(--fs-sm); color: var(--text-secondary); }
      .health__meta {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--fs-xs);
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class HealthTileComponent {
  readonly data = input.required<HealthSignal>();

  readonly severity = computed(() => severityForStatus(this.data().status));

  relative(): string {
    const then = new Date(this.data().lastChecked).getTime();
    const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.round(minutes / 60)} h ago`;
  }
}
