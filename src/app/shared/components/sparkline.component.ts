import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Dependency-free trend line used inside KPI cards and dense table cells. */
@Component({
  selector: 'ctv-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="spark"
      [attr.viewBox]="'0 0 100 ' + height()"
      preserveAspectRatio="none"
      [style.height.px]="height()"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      <defs>
        <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.22" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId() + ')'" />
      <path [attr.d]="linePath()" fill="none" [attr.stroke]="color()" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  `,
  styles: [
    `
      :host { display: block; }
      .spark { display: block; width: 100%; }
    `,
  ],
})
export class SparklineComponent {
  readonly values = input.required<number[]>();
  readonly color = input('#1a73e8');
  readonly height = input(34);
  readonly ariaLabel = input('Trend');

  private readonly points = computed(() => {
    const values = this.values();
    if (values.length < 2) {
      return [] as { x: number; y: number }[];
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = 3;
    const usable = this.height() - padding * 2;

    return values.map((value, index) => ({
      x: (index / (values.length - 1)) * 100,
      y: padding + (1 - (value - min) / range) * usable,
    }));
  });

  readonly linePath = computed(() => {
    const points = this.points();
    if (!points.length) return '';
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const line = this.linePath();
    if (!line) return '';
    return `${line} L100 ${this.height()} L0 ${this.height()} Z`;
  });

  readonly gradientId = computed(() => `spark-${this.color().replace('#', '')}-${this.height()}`);
}
