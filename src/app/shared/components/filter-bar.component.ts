import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SelectOption } from '../../core/models';

export interface FilterDefinition {
  key: string;
  label: string;
  options: SelectOption[];
  width?: number;
}

/**
 * Declarative filter row used by every list page. Filter state is owned by the
 * page so it can be forwarded straight to the data service query.
 */
@Component({
  selector: 'ctv-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectModule],
  template: `
    <div class="filters">
      @for (filter of filters(); track filter.key) {
        <p-select
          styleClass="filter-select"
          [options]="filter.options"
          [ngModel]="value()[filter.key] ?? null"
          (ngModelChange)="change.emit({ key: filter.key, value: $event })"
          [placeholder]="filter.label"
          [showClear]="true"
          [filter]="filter.options.length > 8"
          filterBy="label"
          optionLabel="label"
          optionValue="value"
          [style]="{ minWidth: (filter.width ?? 158) + 'px' }"
          [attr.aria-label]="filter.label"
        />
      }
      @if (hasActiveFilters()) {
        <button type="button" class="btn btn--ghost btn--sm" (click)="clear.emit()">
          <i class="pi pi-filter-slash" aria-hidden="true"></i>
          Clear
        </button>
      }
    </div>
  `,
  styles: [
    `
      .filters {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-wrap: wrap;
      }
    `,
  ],
})
export class FilterBarComponent {
  readonly filters = input.required<FilterDefinition[]>();
  readonly value = input<Record<string, string | null>>({});

  readonly change = output<{ key: string; value: string | null }>();
  readonly clear = output<void>();

  hasActiveFilters(): boolean {
    return Object.values(this.value()).some((entry) => entry !== null && entry !== undefined && entry !== '');
  }
}
