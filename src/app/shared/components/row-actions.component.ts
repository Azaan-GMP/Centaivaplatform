import { ChangeDetectionStrategy, Component, ViewChild, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';

/** Overflow menu for table rows: View / Edit / Disable / Delete, etc. */
@Component({
  selector: 'ctv-row-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuModule],
  template: `
    <button
      type="button"
      class="btn btn--ghost btn--icon btn--sm"
      [attr.aria-label]="ariaLabel()"
      (click)="menu.toggle($event); $event.stopPropagation()"
    >
      <i class="pi pi-ellipsis-h" aria-hidden="true"></i>
    </button>
    <p-menu #menu [model]="items()" [popup]="true" appendTo="body" />
  `,
})
export class RowActionsComponent {
  readonly items = input.required<MenuItem[]>();
  readonly ariaLabel = input('Row actions');

  @ViewChild('menu', { static: true }) menu!: Menu;
}
