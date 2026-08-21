import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FilterBarComponent, FilterDefinition } from './filter-bar.component';
import { SearchInputComponent } from './search-input.component';

/**
 * Standard toolbar above every data table: search, declarative filters and a
 * projected action area for primary buttons.
 */
@Component({
  selector: 'ctv-data-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchInputComponent, FilterBarComponent],
  template: `
    <div class="toolbar">
      @if (showSearch()) {
        <ctv-search-input [(value)]="search" [placeholder]="searchPlaceholder()" [width]="searchWidth()" />
      }

      @if (filters().length) {
        <ctv-filter-bar
          [filters]="filters()"
          [value]="filterValues()"
          (change)="filterChange.emit($event)"
          (clear)="filtersCleared.emit()"
        />
      }

      <div class="toolbar__spacer"></div>

      <ng-content select="[slot=secondary]" />
      <ng-content select="[slot=actions]" />
    </div>
  `,
})
export class DataTableToolbarComponent {
  readonly search = model('');
  readonly searchPlaceholder = input('Search');
  readonly searchWidth = input(260);
  readonly showSearch = input(true);
  readonly filters = input<FilterDefinition[]>([]);
  readonly filterValues = input<Record<string, string | null>>({});

  readonly filterChange = output<{ key: string; value: string | null }>();
  readonly filtersCleared = output<void>();
}
