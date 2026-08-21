import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TrendPoint } from '../../core/models';

interface Plotted {
  x: number;
  y: number;
  point: TrendPoint;
}

/**
 * Compact area/line chart rendered as inline SVG. Deliberately dependency-free
 * so the bundle stays small and the visual language matches the design tokens.
 */
@Component({
  selector: 'ctv-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="chart">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" role="img" [attr.aria-label]="ariaLabel()">
        <defs>
          <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.2" />
            <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0.01" />
          </linearGradient>
        </defs>

        @for (line of gridLines(); track line.y) {
          <line class="grid" x1="38" [attr.y1]="line.y" [attr.x2]="width - 6" [attr.y2]="line.y" />
          <text class="axis" x="32" [attr.y]="line.y + 3.5" text-anchor="end">{{ line.label }}</text>
        }

        <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId() + ')'" />
        <path [attr.d]="linePath()" fill="none" [attr.stroke]="color()" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

        @for (item of plotted(); track item.point.label) {
          <circle
            [attr.cx]="item.x"
            [attr.cy]="item.y"
            [attr.r]="hovered() === item.point.label ? 4.5 : 0"
            [attr.fill]="color()"
            stroke="#fff"
            stroke-width="2"
          />
        }

        @for (item of plotted(); track item.point.label) {
          <rect
            class="hit"
            [attr.x]="item.x - hitWidth() / 2"
            y="6"
            [attr.width]="hitWidth()"
            [attr.height]="height - 28"
            (mouseenter)="hovered.set(item.point.label)"
            (mouseleave)="hovered.set(null)"
          />
        }

        @for (item of labelled(); track item.point.label) {
          <text class="axis" [attr.x]="item.x" [attr.y]="height - 4" text-anchor="middle">{{ item.point.label }}</text>
        }
      </svg>

      @if (activePoint(); as active) {
        <figcaption class="chart__readout">
          <span class="chart__readout-label">{{ active.label }}</span>
          <span class="chart__readout-value">{{ formatValue(active.value) }}</span>
        </figcaption>
      } @else {
        <figcaption class="chart__readout chart__readout--muted">
          <span class="chart__readout-label">Latest</span>
          <span class="chart__readout-value">{{ formatValue(latestValue()) }}</span>
        </figcaption>
      }
    </figure>
  `,
  styles: [
    `
      :host { display: block; }
      .chart { margin: 0; position: relative; }
      svg { display: block; width: 100%; height: auto; }
      .grid { stroke: var(--border-subtle); stroke-width: 1; }
      .axis { font-size: 8px; fill: var(--text-tertiary); font-family: var(--font-sans); }
      .hit { fill: transparent; cursor: crosshair; }
      .chart__readout {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1px;
        background: var(--surface-card);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
      }
      .chart__readout-label { font-size: var(--fs-xs); color: var(--text-tertiary); }
      .chart__readout-value { font-size: var(--fs-md); font-weight: 650; font-variant-numeric: tabular-nums; }
      .chart__readout--muted .chart__readout-value { color: var(--text-secondary); }
    `,
  ],
})
export class LineChartComponent {
  readonly data = input.required<TrendPoint[]>();
  readonly color = input('#1a73e8');
  readonly ariaLabel = input('Trend chart');
  readonly labelEvery = input(2);

  protected readonly width = 320;
  protected readonly height = 150;

  readonly hovered = signal<string | null>(null);

  readonly plotted = computed<Plotted[]>(() => {
    const data = this.data();
    if (data.length === 0) return [];
    const values = data.map((point) => point.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const top = 10;
    const bottom = this.height - 22;
    const left = 40;
    const right = this.width - 8;

    return data.map((point, index) => ({
      point,
      x: data.length === 1 ? (left + right) / 2 : left + (index / (data.length - 1)) * (right - left),
      y: bottom - ((point.value - min) / span) * (bottom - top),
    }));
  });

  readonly linePath = computed(() =>
    this.plotted()
      .map((item, index) => `${index === 0 ? 'M' : 'L'}${item.x.toFixed(2)} ${item.y.toFixed(2)}`)
      .join(' '),
  );

  readonly areaPath = computed(() => {
    const items = this.plotted();
    if (items.length === 0) return '';
    const bottom = this.height - 22;
    return `${this.linePath()} L${items[items.length - 1]!.x.toFixed(2)} ${bottom} L${items[0]!.x.toFixed(2)} ${bottom} Z`;
  });

  readonly gridLines = computed(() => {
    const data = this.data();
    if (data.length === 0) return [];
    const values = data.map((point) => point.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const top = 10;
    const bottom = this.height - 22;

    return [0, 0.5, 1].map((ratio) => ({
      y: bottom - ratio * (bottom - top),
      label: this.formatValue(Math.round(min + ratio * span)),
    }));
  });

  readonly labelled = computed(() => this.plotted().filter((_, index) => index % this.labelEvery() === 0));

  readonly hitWidth = computed(() => {
    const count = this.data().length;
    return count > 1 ? (this.width - 48) / (count - 1) : this.width;
  });

  readonly activePoint = computed(() => {
    const label = this.hovered();
    return label ? (this.data().find((point) => point.label === label) ?? null) : null;
  });

  readonly latestValue = computed(() => this.data().at(-1)?.value ?? 0);

  readonly gradientId = computed(() => `line-${this.color().replace('#', '')}`);

  formatValue(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 10_000) return `${Math.round(value / 1000)}k`;
    return new Intl.NumberFormat('en-GB').format(value);
  }
}
