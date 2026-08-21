import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Entitlement, SelectOption } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { PlansService, ProductsService } from '../../core/services/data-contracts';
import {
  ColumnDef,
  DataTableComponent,
  DataTableToolbarComponent,
  DefinitionItem,
  DefinitionListComponent,
  DetailDrawerComponent,
  FilterDefinition,
  PageHeaderComponent,
  RowActionsComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-entitlements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    DataTableComponent,
    DataTableToolbarComponent,
    DetailDrawerComponent,
    DefinitionListComponent,
    RowActionsComponent,
  ],
  templateUrl: './entitlements.page.html',
  styleUrl: './entitlements.page.scss',
})
export class EntitlementsPage {
  private readonly plans = inject(PlansService);
  private readonly products = inject(ProductsService);
  private readonly notifications = inject(NotificationService);

  readonly rows = signal<Entitlement[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly filterValues = signal<Record<string, string | null>>({});
  readonly productOptions = signal<SelectOption[]>([]);

  readonly drawerOpen = signal(false);
  readonly selected = signal<Entitlement | null>(null);

  readonly columns: ColumnDef[] = [
    { key: 'name', header: 'Entitlement', width: '260px' },
    { key: 'key', header: 'Key', width: '250px' },
    { key: 'productName', header: 'Product', width: '190px' },
    { key: 'type', header: 'Type', width: '150px' },
    { key: 'valueType', header: 'Value type', width: '124px', secondary: true },
    { key: 'defaultValue', header: 'Default', width: '140px' },
    { key: 'planCount', header: 'Plans', width: '86px', align: 'right', secondary: true },
    { key: 'status', header: 'Status', width: '120px' },
  ];

  readonly filters = computed<FilterDefinition[]>(() => [
    { key: 'productKey', label: 'Product', options: this.productOptions(), width: 200 },
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'Feature Toggle', value: 'Feature Toggle' },
        { label: 'Quota', value: 'Quota' },
        { label: 'Limit', value: 'Limit' },
        { label: 'Configuration', value: 'Configuration' },
      ],
      width: 170,
    },
    {
      key: 'valueType',
      label: 'Value type',
      options: [
        { label: 'Boolean', value: 'Boolean' },
        { label: 'Integer', value: 'Integer' },
        { label: 'Decimal', value: 'Decimal' },
        { label: 'String', value: 'String' },
      ],
      width: 150,
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Deprecated', value: 'Deprecated' },
      ],
      width: 150,
    },
  ]);

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((entitlement) => {
      if (term && !`${entitlement.name} ${entitlement.key} ${entitlement.description} ${entitlement.productName}`.toLowerCase().includes(term)) {
        return false;
      }
      if (filters['productKey'] && entitlement.productKey !== filters['productKey']) return false;
      if (filters['type'] && entitlement.type !== filters['type']) return false;
      if (filters['valueType'] && entitlement.valueType !== filters['valueType']) return false;
      if (filters['status'] && entitlement.status !== filters['status']) return false;
      return true;
    });
  });

  readonly typeCounts = computed(() => {
    const all = this.rows();
    return {
      toggles: all.filter((entitlement) => entitlement.type === 'Feature Toggle').length,
      quotas: all.filter((entitlement) => entitlement.type === 'Quota').length,
      limits: all.filter((entitlement) => entitlement.type === 'Limit').length,
      configuration: all.filter((entitlement) => entitlement.type === 'Configuration').length,
    };
  });

  readonly detailItems = computed<DefinitionItem[]>(() => {
    const entitlement = this.selected();
    if (!entitlement) return [];
    return [
      { label: 'Entitlement ID', value: entitlement.id, mono: true },
      { label: 'Key', value: entitlement.key, mono: true },
      { label: 'Product', value: entitlement.productName },
      { label: 'Type', value: entitlement.type },
      { label: 'Value type', value: entitlement.valueType },
      { label: 'Default value', value: entitlement.defaultValue },
      { label: 'Unit', value: entitlement.unit ?? '—' },
      { label: 'Plans referencing', value: String(entitlement.planCount) },
      { label: 'Status', value: entitlement.status },
    ];
  });

  constructor() {
    this.plans.entitlements().subscribe((entitlements) => {
      this.rows.set(entitlements);
      this.loading.set(false);
    });
    this.products.all().subscribe((products) =>
      this.productOptions.set(products.map((product) => ({ label: product.name, value: product.key }))),
    );
  }

  onFilterChange(change: { key: string; value: string | null }): void {
    this.filterValues.update((current) => ({ ...current, [change.key]: change.value }));
  }

  clearFilters(): void {
    this.filterValues.set({});
  }

  open(entitlement: Entitlement): void {
    this.selected.set(entitlement);
    this.drawerOpen.set(true);
  }

  rowMenu(entitlement: Entitlement): MenuItem[] {
    return [
      { label: 'View', icon: 'pi pi-eye', command: () => this.open(entitlement) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.notifications.info('Edit entitlement', `${entitlement.name} would open the edit form.`) },
      { separator: true },
      { label: 'Deprecate', icon: 'pi pi-ban', styleClass: 'menu-item-danger', command: () => this.notifications.warn('Deprecate entitlement', `${entitlement.key} would be flagged for removal.`) },
    ];
  }

  create(): void {
    this.notifications.info('Create entitlement', 'Entitlement authoring is enabled during API integration.');
  }

  displayValue(entitlement: Entitlement): string {
    if (entitlement.valueType === 'Boolean') {
      return entitlement.defaultValue === 'true' ? 'Enabled' : 'Disabled';
    }
    return `${entitlement.defaultValue}${entitlement.unit ? ' ' + entitlement.unit : ''}`;
  }
}
