import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TrendPoint } from '../../core/models';

const PALETTE = ['#1a73e8', '#34a853', '#7c3aed', '#f59e0b', '#0891b2', '#dc2626'];

@Component({
  selector: 'ctv-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="donut">
      <svg viewBox="0 0 42 42" role="img" [attr.aria-label]="ariaLabel()">
        <circle class="track" cx="21" cy="21" r="15.915" fill="none" stroke-width="5" />
        @for (segment of segments(); track segment.label) {
          <circle
            class="segment"
            cx="21"
            cy="21"
            r="15.915"
            fill="none"
            [attr.stroke]="segment.color"
            [attr.stroke-width]="hovered() === segment.label ? 6.4 : 5"
            [attr.stroke-dasharray]="segment.dash"
            [attr.stroke-dashoffset]="segment.offset"
            stroke-linecap="butt"
            (mouseenter)="hovered.set(segment.label)"
            (mouseleave)="hovered.set(null)"
          />
        }
        <text class="donut__value" x="21" y="20.4" text-anchor="middle">{{ centerValue() }}</text>
        <text class="donut__label" x="21" y="25" text-anchor="middle">{{ centerLabel() }}</text>
      </svg>

      <ul class="legend">
        @for (segment of segments(); track segment.label) {
          <li
            [class.legend__item--active]="hovered() === segment.label"
            (mouseenter)="hovered.set(segment.label)"
            (mouseleave)="hovered.set(null)"
          >
            <span class="legend__swatch" [style.background]="segment.color"></span>
            <span class="legend__label u-truncate">{{ segment.label }}</span>
            <span class="legend__value">{{ segment.value }}</span>
            <span class="legend__pct">{{ segment.percent }}%</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .donut {
        display: grid;
        grid-template-columns: 148px minmax(0, 1fr);
        gap: var(--space-5);
        align-items: center;
      }
      @media (max-width: 520px) {
        .donut { grid-template-columns: minmax(0, 1fr); }
      }
      svg { width: 100%; height: auto; transform: rotate(-90deg); }
      .track { stroke: var(--surface-sunken); }
      .segment { transition: stroke-width 0.16s ease; cursor: pointer; }
      .donut__value {
        font-size: 6px;
        font-weight: 700;
        fill: var(--text-primary);
        transform: rotate(90deg);
        transform-origin: 21px 21px;
        font-family: var(--font-sans);
      }
      .donut__label {
        font-size: 2.6px;
        fill: var(--text-tertiary);
        transform: rotate(90deg);
        transform-origin: 21px 21px;
        font-family: var(--font-sans);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .legend { display: flex; flex-direction: column; gap: 2px; }
      .legend li {
        display: grid;
        grid-template-columns: 10px minmax(0, 1fr) auto auto;
        align-items: center;
        gap: var(--space-2);
        padding: 5px 6px;
        border-radius: var(--radius-sm);
        font-size: var(--fs-base);
        cursor: default;
      }
      .legend__item--active { background: var(--surface-hover); }
      .legend__swatch { width: 8px; height: 8px; border-radius: 2px; }
      .legend__label { color: var(--text-secondary); }
      .legend__value { font-weight: 600; font-variant-numeric: tabular-nums; }
      .legend__pct { font-size: var(--fs-sm); color: var(--text-tertiary); width: 34px; text-align: right; }
    `,
  ],
})
export class DonutChartComponent {
  readonly data = input.required<TrendPoint[]>();
  readonly centerLabel = input('Total');
  readonly ariaLabel = input('Distribution chart');

  readonly hovered = signal<string | null>(null);

  readonly total = computed(() => this.data().reduce((sum, point) => sum + point.value, 0));

  readonly segments = computed(() => {
    const total = this.total() || 1;
    let cursor = 0;

    return this.data().map((point, index) => {
      const percent = (point.value / total) * 100;
      const dash = `${percent.toFixed(2)} ${(100 - percent).toFixed(2)}`;
      const offset = (100 - cursor + 25) % 100;
      cursor += percent;

      return {
        label: point.label,
        value: point.value,
        percent: Math.round(percent),
        color: PALETTE[index % PALETTE.length]!,
        dash,
        offset: offset.toFixed(2),
      };
    });
  });

  readonly centerValue = computed(() => {
    const label = this.hovered();
    if (label) {
      return String(this.data().find((point) => point.label === label)?.value ?? this.total());
    }
    return String(this.total());
  });
}
