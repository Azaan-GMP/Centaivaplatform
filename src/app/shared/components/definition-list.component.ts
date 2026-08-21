import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface DefinitionItem {
  label: string;
  value: string;
  mono?: boolean;
  hint?: string;
}

@Component({
  selector: 'ctv-definition-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="dl" [class.dl--2]="columns() === 2">
      @for (item of items(); track item.label) {
        <div class="dl__item">
          <dt class="dl__label">{{ item.label }}</dt>
          <dd class="dl__value" [class.u-mono]="item.mono" [attr.title]="item.hint || null">{{ item.value }}</dd>
        </div>
      }
    </dl>
  `,
  styles: [
    `
      :host { display: block; }
      dd { margin: 0; }
    `,
  ],
})
export class DefinitionListComponent {
  readonly items = input.required<DefinitionItem[]>();
  readonly columns = input<'auto' | 2>('auto');
}
