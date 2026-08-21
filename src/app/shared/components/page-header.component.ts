import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BreadcrumbComponent, Crumb } from './breadcrumb.component';

@Component({
  selector: 'ctv-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent],
  template: `
    <header class="page-header">
      @if (crumbs().length) {
        <ctv-breadcrumb [items]="crumbs()" />
      }
      <div class="page-header__row">
        <div class="page-header__text">
          <div class="page-header__title-row">
            <h1>{{ title() }}</h1>
            <ng-content select="[slot=title-adornment]" />
          </div>
          @if (subtitle()) {
            <p class="page-header__subtitle">{{ subtitle() }}</p>
          }
        </div>
        <div class="page-header__actions">
          <ng-content select="[slot=actions]" />
        </div>
      </div>
      <ng-content />
    </header>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .page-header__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
        flex-wrap: wrap;
      }
      .page-header__text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .page-header__title-row {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      h1 {
        font-size: var(--fs-2xl);
        font-weight: 650;
        letter-spacing: -0.025em;
        margin: 0;
      }
      .page-header__subtitle {
        font-size: var(--fs-md);
        color: var(--text-secondary);
        max-width: 78ch;
      }
      .page-header__actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-wrap: wrap;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly crumbs = input<Crumb[]>([]);
}
