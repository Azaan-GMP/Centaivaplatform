import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { severityForUtilization } from '../status.util';

@Component({
  selector: 'ctv-metric-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric">
      @if (label() || showValue()) {
        <div class="metric__head">
          @if (label()) {
            <span class="metric__label u-truncate">{{ label() }}</span>
          }
          @if (showValue()) {
            <span class="metric__value">
              @if (valueText()) {
                {{ valueText() }}
              } @else {
                {{ formatted(used()) }} / {{ formatted(total()) }}
              }
              <span class="metric__pct">{{ percent() }}%</span>
            </span>
          }
        </div>
      }
      <div
        class="meter"
        [class.meter--lg]="size() === 'lg'"
        [class.meter--sm]="size() === 'sm'"
        role="progressbar"
        [attr.aria-valuenow]="percent()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="label() || 'Utilisation'"
      >
        <div class="meter__fill" [class]="'meter__fill--' + severity()" [style.width.%]="clamped()"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .metric { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
      .metric__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-3);
      }
      .metric__label { font-size: var(--fs-base); color: var(--text-secondary); }
      .metric__value {
        font-size: var(--fs-sm);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .metric__pct { color: var(--text-tertiary); margin-left: 6px; font-weight: 500; }
    `,
  ],
})
export class MetricProgressComponent {
  readonly used = input.required<number>();
  readonly total = input.required<number>();
  readonly label = input<string | null>(null);
  readonly valueText = input<string | null>(null);
  readonly showValue = input(true);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly percent = computed(() => {
    const total = this.total();
    if (total <= 0) return 0;
    return Math.round((this.used() / total) * 100);
  });

  readonly clamped = computed(() => Math.min(100, Math.max(0, this.percent())));
  readonly severity = computed(() => severityForUtilization(this.percent()));

  formatted(value: number): string {
    return new Intl.NumberFormat('en-GB').format(value);
  }
}
