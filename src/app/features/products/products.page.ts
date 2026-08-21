import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Product } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { ProductsService } from '../../core/services/data-contracts';
import {
  ColumnDef,
  DataTableComponent,
  DataTableToolbarComponent,
  FilterDefinition,
  PageHeaderComponent,
  RowActionsComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    DataTableComponent,
    DataTableToolbarComponent,
    RowActionsComponent,
  ],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss',
})
export class ProductsPage {
  private readonly products = inject(ProductsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly rows = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly view = signal<'cards' | 'list'>('cards');
  readonly filterValues = signal<Record<string, string | null>>({});

  readonly columns: ColumnDef[] = [
    { key: 'name', header: 'Product', width: '260px' },
    { key: 'key', header: 'Key', width: '210px' },
    { key: 'applicationCount', header: 'Applications', width: '124px', align: 'right' },
    { key: 'moduleCount', header: 'Modules', width: '104px', align: 'right', secondary: true },
    { key: 'featureCount', header: 'Features', width: '104px', align: 'right', secondary: true },
    { key: 'tenantCount', header: 'Tenants', width: '100px', align: 'right' },
    { key: 'subscriptionCount', header: 'Subscriptions', width: '128px', align: 'right' },
    { key: 'status', header: 'Status', width: '120px' },
  ];

  readonly filters: FilterDefinition[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Beta', value: 'Beta' },
        { label: 'Deprecated', value: 'Deprecated' },
        { label: 'Draft', value: 'Draft' },
      ],
      width: 140,
    },
    {
      key: 'lifecycle',
      label: 'Lifecycle',
      options: [
        { label: 'GA', value: 'GA' },
        { label: 'Beta', value: 'Beta' },
        { label: 'Preview', value: 'Preview' },
        { label: 'Sunset', value: 'Sunset' },
      ],
      width: 140,
    },
  ];

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((product) => {
      if (term) {
        const haystack = `${product.name} ${product.key} ${product.description} ${product.owner}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters['status'] && product.status !== filters['status']) return false;
      if (filters['lifecycle'] && product.lifecycle !== filters['lifecycle']) return false;
      return true;
    });
  });

  readonly totals = computed(() => {
    const all = this.rows();
    return {
      products: all.length,
      applications: all.reduce((total, product) => total + product.applicationCount, 0),
      modules: all.reduce((total, product) => total + product.moduleCount, 0),
      features: all.reduce((total, product) => total + product.featureCount, 0),
      permissions: all.reduce((total, product) => total + product.permissionCount, 0),
    };
  });

  constructor() {
    this.products.all().subscribe((products) => {
      this.rows.set(products);
      this.loading.set(false);
    });
  }

  onFilterChange(change: { key: string; value: string | null }): void {
    this.filterValues.update((current) => ({ ...current, [change.key]: change.value }));
  }

  clearFilters(): void {
    this.filterValues.set({});
  }

  open(product: Product): void {
    void this.router.navigate(['/app/products', product.id]);
  }

  rowMenu(product: Product): MenuItem[] {
    return [
      { label: 'View', icon: 'pi pi-eye', command: () => this.open(product) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.notifications.info('Edit product', `${product.name} would open the edit form.`) },
      { label: 'Open catalog', icon: 'pi pi-th-large', command: () => void this.router.navigate(['/app/catalog']) },
      { separator: true },
      { label: 'Deprecate', icon: 'pi pi-ban', styleClass: 'menu-item-danger', command: () => this.notifications.warn('Deprecate product', `${product.name} would be flagged for sunset.`) },
    ];
  }

  createProduct(): void {
    this.notifications.info('Create product', 'Product registration is enabled during API integration.');
  }
}
