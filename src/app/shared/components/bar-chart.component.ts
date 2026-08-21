import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TrendPoint } from '../../core/models';

@Component({
  selector: 'ctv-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bars" role="img" [attr.aria-label]="ariaLabel()">
      @for (bar of bars(); track bar.label) {
        <div
          class="bars__col"
          (mouseenter)="hovered.set(bar.label)"
          (mouseleave)="hovered.set(null)"
        >
          <div class="bars__value" [class.bars__value--visible]="hovered() === bar.label">{{ bar.display }}</div>
          <div class="bars__track">
            <div
              class="bars__fill"
              [style.height.%]="bar.height"
              [style.background]="color()"
              [class.bars__fill--active]="hovered() === bar.label"
            ></div>
          </div>
          <div class="bars__label">{{ bar.label }}</div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .bars {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 150px;
      }
      .bars__col {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
        min-width: 0;
      }
      .bars__value {
        font-size: var(--fs-xs);
        font-weight: 600;
        text-align: center;
        color: var(--text-primary);
        height: 14px;
        opacity: 0;
        transition: opacity 0.14s ease;
        font-variant-numeric: tabular-nums;
      }
      .bars__value--visible { opacity: 1; }
      .bars__track {
        flex: 1 1 auto;
        display: flex;
        align-items: flex-end;
        background: var(--surface-sunken);
        border-radius: var(--radius-xs);
        overflow: hidden;
      }
      .bars__fill {
        width: 100%;
        border-radius: var(--radius-xs) var(--radius-xs) 0 0;
        opacity: 0.85;
        transition: opacity 0.14s ease, height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 2px;
      }
      .bars__fill--active { opacity: 1; }
      .bars__label {
        margin-top: 6px;
        font-size: var(--fs-xs);
        color: var(--text-tertiary);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class BarChartComponent {
  readonly data = input.required<TrendPoint[]>();
  readonly color = input('#1a73e8');
  readonly ariaLabel = input('Bar chart');

  readonly hovered = signal<string | null>(null);

  readonly bars = computed(() => {
    const data = this.data();
    const max = Math.max(...data.map((point) => point.value), 1);

    return data.map((point) => ({
      label: point.label,
      height: Math.max(2, (point.value / max) * 100),
      display: new Intl.NumberFormat('en-GB').format(point.value),
    }));
  });
}
