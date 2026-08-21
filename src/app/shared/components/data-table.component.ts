import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
  signal,
} from '@angular/core';
import { EmptyStateComponent } from './empty-state.component';

export interface ColumnDef {
  /** Property path used for sorting and as the template switch key. */
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
  /** Hidden on narrow viewports to protect desktop density elsewhere. */
  secondary?: boolean;
}

type Row = Record<string, unknown>;

/** Rows arrive as concrete domain interfaces; reads go through `asRow`. */
function asRow(value: object): Row {
  return value as Row;
}

/**
 * The console's standard grid: sticky header, client-side sort, pagination,
 * hover and empty/loading states. Cells are projected by the page through a
 * single `#cell` template so each page controls its own presentation.
 */
@Component({
  selector: 'ctv-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, EmptyStateComponent],
  template: `
    <div class="table-wrap">
      <table class="ctv-table" [style.min-width]="minWidth()">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th
                [class.is-sortable]="column.sortable !== false"
                [class.u-hide-tablet]="column.secondary"
                [style.width]="column.width || null"
                [style.text-align]="column.align || null"
                [attr.aria-sort]="ariaSort(column)"
                (click)="column.sortable !== false && toggleSort(column.key)"
              >
                <span class="th-inner">
                  {{ column.header }}
                  @if (column.sortable !== false) {
                    <i
                      class="th-sort pi"
                      [class.pi-sort-alt]="sortField() !== column.key"
                      [class.pi-sort-amount-up-alt]="sortField() === column.key && sortOrder() === 1"
                      [class.pi-sort-amount-down]="sortField() === column.key && sortOrder() === -1"
                      [class.th-sort--active]="sortField() === column.key"
                      aria-hidden="true"
                    ></i>
                  }
                </span>
              </th>
            }
            @if (hasRowActions()) {
              <th class="td-actions" aria-label="Row actions"></th>
            }
          </tr>
        </thead>

        <tbody>
          @if (loading()) {
            @for (skeleton of skeletonRows; track skeleton) {
              <tr>
                @for (column of columns(); track column.key) {
                  <td [class.u-hide-tablet]="column.secondary">
                    <div class="skeleton" style="height: 12px; width: 70%"></div>
                  </td>
                }
                @if (hasRowActions()) {
                  <td class="td-actions"></td>
                }
              </tr>
            }
          } @else {
            @for (row of pageRows(); track trackRow(row); let index = $index) {
              <tr
                [class.is-clickable]="clickable()"
                [class.is-selected]="isSelected(row)"
                (click)="clickable() && rowClick.emit(row)"
                [attr.tabindex]="clickable() ? 0 : null"
                (keydown.enter)="clickable() && rowClick.emit(row)"
              >
                @for (column of columns(); track column.key) {
                  <td [class.u-hide-tablet]="column.secondary" [style.text-align]="column.align || null">
                    <ng-container
                      [ngTemplateOutlet]="cellTemplate() ?? null"
                      [ngTemplateOutletContext]="{ $implicit: row, column: column, index: index }"
                    />
                  </td>
                }
                @if (hasRowActions()) {
                  <td class="td-actions" (click)="$event.stopPropagation()">
                    <ng-container
                      [ngTemplateOutlet]="actionsTemplate() ?? null"
                      [ngTemplateOutletContext]="{ $implicit: row, index: index }"
                    />
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>

      @if (!loading() && sorted().length === 0) {
        <ctv-empty-state
          [icon]="emptyIcon()"
          [title]="emptyTitle()"
          [message]="emptyMessage()"
        />
      }
    </div>

    @if (!loading() && sorted().length > 0 && paginate()) {
      <div class="table-footer">
        <span>
          Showing <strong>{{ rangeStart() }}</strong>–<strong>{{ rangeEnd() }}</strong>
          of <strong>{{ sorted().length }}</strong> {{ rowNoun() }}
        </span>

        <div class="pager">
          <button type="button" class="pager__btn" aria-label="First page" [disabled]="page() === 1" (click)="goTo(1)">
            <i class="pi pi-angle-double-left" aria-hidden="true"></i>
          </button>
          <button type="button" class="pager__btn" aria-label="Previous page" [disabled]="page() === 1" (click)="goTo(page() - 1)">
            <i class="pi pi-angle-left" aria-hidden="true"></i>
          </button>
          @for (pageNumber of pageWindow(); track pageNumber) {
            <button
              type="button"
              class="pager__btn"
              [class.pager__btn--active]="pageNumber === page()"
              [attr.aria-current]="pageNumber === page() ? 'page' : null"
              (click)="goTo(pageNumber)"
            >
              {{ pageNumber }}
            </button>
          }
          <button type="button" class="pager__btn" aria-label="Next page" [disabled]="page() === pageCount()" (click)="goTo(page() + 1)">
            <i class="pi pi-angle-right" aria-hidden="true"></i>
          </button>
          <button type="button" class="pager__btn" aria-label="Last page" [disabled]="page() === pageCount()" (click)="goTo(pageCount())">
            <i class="pi pi-angle-double-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    }
  `,
})
export class DataTableComponent {
  readonly columns = input.required<ColumnDef[]>();
  readonly rows = input.required<readonly object[]>();
  readonly loading = input(false);
  readonly clickable = input(true);
  readonly paginate = input(true);
  readonly pageSize = input(12);
  readonly minWidth = input('820px');
  readonly rowKey = input('id');
  readonly rowNoun = input('records');
  readonly selectedId = input<string | null>(null);
  readonly emptyIcon = input('pi pi-inbox');
  readonly emptyTitle = input('Nothing to show');
  readonly emptyMessage = input('Try adjusting your search or filters.');
  readonly defaultSortField = input<string | null>(null);
  readonly defaultSortOrder = input<1 | -1>(1);

  readonly rowClick = output<object>();

  readonly cellTemplate = contentChild<TemplateRef<unknown>>('cell');
  readonly actionsTemplate = contentChild<TemplateRef<unknown>>('rowActions');

  protected readonly skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  private readonly sortFieldOverride = signal<string | null | undefined>(undefined);
  private readonly sortOrderOverride = signal<1 | -1 | undefined>(undefined);
  private readonly requestedPage = signal(1);

  readonly sortField = computed(() => {
    const override = this.sortFieldOverride();
    return override === undefined ? this.defaultSortField() : override;
  });

  readonly sortOrder = computed(() => this.sortOrderOverride() ?? this.defaultSortOrder());

  readonly hasRowActions = computed(() => !!this.actionsTemplate());

  readonly sorted = computed<object[]>(() => {
    const rows = [...this.rows()];
    const field = this.sortField();
    if (!field) {
      return rows;
    }
    const order = this.sortOrder();

    return rows.sort((a, b) => {
      const left = this.read(asRow(a), field);
      const right = this.read(asRow(b), field);
      if (left === right) return 0;
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * order;
      if (typeof left === 'boolean' && typeof right === 'boolean') return (Number(left) - Number(right)) * order;
      return String(left).localeCompare(String(right), 'en', { numeric: true }) * order;
    });
  });

  readonly pageCount = computed(() =>
    this.paginate() ? Math.max(1, Math.ceil(this.sorted().length / this.pageSize())) : 1,
  );

  readonly page = computed(() => Math.min(this.requestedPage(), this.pageCount()));

  readonly pageRows = computed(() => {
    if (!this.paginate()) {
      return this.sorted();
    }
    const start = (this.page() - 1) * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  readonly rangeStart = computed(() => (this.sorted().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.sorted().length));

  readonly pageWindow = computed(() => {
    const count = this.pageCount();
    const current = this.page();
    const size = Math.min(count, 5);
    let start = Math.max(1, current - Math.floor(size / 2));
    if (start + size - 1 > count) {
      start = Math.max(1, count - size + 1);
    }
    return Array.from({ length: size }, (_, index) => start + index);
  });

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrderOverride.set(this.sortOrder() === 1 ? -1 : 1);
    } else {
      this.sortFieldOverride.set(field);
      this.sortOrderOverride.set(1);
    }
    this.requestedPage.set(1);
  }

  goTo(page: number): void {
    this.requestedPage.set(Math.min(Math.max(1, page), this.pageCount()));
  }

  ariaSort(column: ColumnDef): string | null {
    if (column.sortable === false || this.sortField() !== column.key) {
      return column.sortable === false ? null : 'none';
    }
    return this.sortOrder() === 1 ? 'ascending' : 'descending';
  }

  isSelected(row: object): boolean {
    const id = this.selectedId();
    return !!id && String(asRow(row)[this.rowKey()]) === id;
  }

  trackRow(row: object): string {
    return String(asRow(row)[this.rowKey()] ?? JSON.stringify(row));
  }

  private read(row: Row, field: string): unknown {
    return field.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Row)[part];
      }
      return undefined;
    }, row);
  }
}
