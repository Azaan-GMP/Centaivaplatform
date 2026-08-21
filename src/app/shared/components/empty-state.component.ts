import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ctv-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" [class.empty--compact]="compact()">
      <span class="empty__icon">
        <i [class]="icon()" aria-hidden="true"></i>
      </span>
      <p class="empty__title">{{ title() }}</p>
      @if (message()) {
        <p class="empty__message">{{ message() }}</p>
      }
      <div class="empty__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: var(--space-8) var(--space-5);
        text-align: center;
      }
      .empty--compact { padding: var(--space-6) var(--space-4); }
      .empty__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-lg);
        background: var(--surface-sunken);
        color: var(--text-tertiary);
        font-size: 16px;
        margin-bottom: 2px;
      }
      .empty__title {
        font-size: var(--fs-md);
        font-weight: 600;
        color: var(--text-primary);
      }
      .empty__message {
        font-size: var(--fs-base);
        color: var(--text-secondary);
        max-width: 48ch;
      }
      .empty__actions:not(:empty) { margin-top: var(--space-3); }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input('pi pi-inbox');
  readonly title = input('Nothing here yet');
  readonly message = input<string | null>(null);
  readonly compact = input(false);
}
