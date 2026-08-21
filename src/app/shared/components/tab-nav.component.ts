import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  icon?: string;
}

@Component({
  selector: 'ctv-tab-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist" [attr.aria-label]="ariaLabel()">
      @for (tab of tabs(); track tab.key) {
        <button
          type="button"
          role="tab"
          class="tabs__item"
          [class.tabs__item--active]="active() === tab.key"
          [attr.aria-selected]="active() === tab.key"
          (click)="active.set(tab.key)"
        >
          @if (tab.icon) {
            <i [class]="tab.icon" aria-hidden="true"></i>
          }
          {{ tab.label }}
          @if (tab.count !== undefined) {
            <span class="tabs__count">{{ tab.count }}</span>
          }
        </button>
      }
    </div>
  `,
})
export class TabNavComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly active = model.required<string>();
  readonly ariaLabel = input('Sections');
}
