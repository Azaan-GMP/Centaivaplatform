import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Severity } from '../../core/models';
import { SparklineComponent } from './sparkline.component';

@Component({
  selector: 'ctv-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SparklineComponent],
  template: `
    <article class="stat-card" [class.stat-card--interactive]="interactive()">
      <div class="stat-card__top">
        <span class="stat-card__label">{{ label() }}</span>
        @if (icon()) {
          <span class="stat-card__icon" [class]="'stat-card__icon--' + accent()">
            <i [class]="icon()" aria-hidden="true"></i>
          </span>
        }
      </div>

      <div class="stat-value">{{ value() }}</div>

      <div class="stat-card__bottom">
        @if (trend() !== null) {
          <span class="trend" [class]="'trend--' + trendDirection()">
            <i [class]="trendIcon()" aria-hidden="true"></i>
            {{ trendText() }}
          </span>
        }
        @if (trendLabel()) {
          <span class="stat-card__note">{{ trendLabel() }}</span>
        }
        @if (footnote()) {
          <span class="stat-card__note">{{ footnote() }}</span>
        }
      </div>

      @if (series().length > 1) {
        <div class="stat-card__spark">
          <ctv-sparkline [values]="series()" [color]="sparkColor()" [height]="34" />
        </div>
      }
    </article>
  `,
  styles: [
    `
      .stat-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: var(--space-4);
        background: var(--surface-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xs);
        overflow: hidden;
        min-height: 118px;
      }
      .stat-card--interactive {
        cursor: pointer;
        transition: box-shadow 0.16s ease, border-color 0.16s ease;
      }
      .stat-card--interactive:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--border-strong);
      }
      .stat-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
      }
      .stat-card__label {
        font-size: var(--fs-sm);
        font-weight: 600;
        color: var(--text-secondary);
      }
      .stat-card__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: var(--radius-sm);
        font-size: 12px;
      }
      .stat-card__icon--primary { background: var(--color-primary-soft); color: #1553b0; }
      .stat-card__icon--success { background: var(--color-success-soft); color: #1e7e37; }
      .stat-card__icon--warning { background: var(--color-warning-soft); color: #a26205; }
      .stat-card__icon--danger { background: var(--color-danger-soft); color: #b91c1c; }
      .stat-card__icon--info { background: var(--color-info-soft); color: #0e7490; }
      .stat-card__icon--purple { background: var(--color-purple-soft); color: #6027d0; }
      .stat-card__icon--neutral { background: var(--color-neutral-soft); color: #4b5563; }
      .stat-card__bottom {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-wrap: wrap;
        min-height: 18px;
      }
      .stat-card__note {
        font-size: var(--fs-sm);
        color: var(--text-tertiary);
      }
      .stat-card__spark {
        margin: 4px -16px -16px;
        opacity: 0.9;
      }
      .trend i { font-size: 10px; }
    `,
  ],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string | null>('pi pi-chart-line');
  readonly accent = input<Severity>('primary');
  readonly trend = input<number | null>(null);
  readonly trendLabel = input<string | null>(null);
  readonly footnote = input<string | null>(null);
  readonly series = input<number[]>([]);
  readonly interactive = input(false);

  readonly trendDirection = computed(() => {
    const value = this.trend() ?? 0;
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
  });

  readonly trendIcon = computed(() => {
    const direction = this.trendDirection();
    if (direction === 'up') return 'pi pi-arrow-up-right';
    if (direction === 'down') return 'pi pi-arrow-down-right';
    return 'pi pi-minus';
  });

  readonly trendText = computed(() => {
    const value = this.trend() ?? 0;
    if (value === 0) return '0.0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  });

  readonly sparkColor = computed(() => (this.trendDirection() === 'down' ? '#dc2626' : '#1a73e8'));
}
