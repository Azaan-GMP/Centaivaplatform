import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ctv-section-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      @if (title()) {
        <header class="card__header">
          <div>
            <h2 class="card__title">{{ title() }}</h2>
            @if (description()) {
              <p class="card__desc">{{ description() }}</p>
            }
          </div>
          <div class="card__header-actions">
            <ng-content select="[slot=actions]" />
          </div>
        </header>
      }
      <div [class]="bodyClass()">
        <ng-content />
      </div>
      <ng-content select="[slot=footer]" />
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .card__header-actions { display: flex; align-items: center; gap: var(--space-2); }
    `,
  ],
})
export class SectionCardComponent {
  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);
  /** `flush` removes body padding so tables can sit edge to edge. */
  readonly padding = input<'default' | 'flush' | 'tight'>('default');

  bodyClass(): string {
    if (this.padding() === 'flush') return 'card__body card__body--flush';
    if (this.padding() === 'tight') return 'card__body card__body--tight';
    return 'card__body';
  }
}
