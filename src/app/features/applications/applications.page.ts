import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Application, FeatureFlag, Role, SelectOption } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import {
  ApplicationsService,
  ProductsService,
  RolesService,
  SecurityService,
} from '../../core/services/data-contracts';
import {
  ColumnDef,
  DataTableComponent,
  DataTableToolbarComponent,
  DefinitionItem,
  DefinitionListComponent,
  DetailDrawerComponent,
  FilterDefinition,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

@Component({
  selector: 'ctv-applications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    DataTableComponent,
    DataTableToolbarComponent,
    DetailDrawerComponent,
    DefinitionListComponent,
    TabNavComponent,
    RelativeTimePipe,
  ],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.scss',
})
export class ApplicationsPage {
  private readonly applications = inject(ApplicationsService);
  private readonly products = inject(ProductsService);
  private readonly roles = inject(RolesService);
  private readonly security = inject(SecurityService);
  private readonly notifications = inject(NotificationService);

  readonly rows = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly filterValues = signal<Record<string, string | null>>({});
  readonly productOptions = signal<SelectOption[]>([]);

  readonly drawerOpen = signal(false);
  readonly selected = signal<Application | null>(null);
  readonly activeTab = signal('overview');

  readonly allRoles = signal<Role[]>([]);
  readonly allFlags = signal<FeatureFlag[]>([]);

  readonly columns: ColumnDef[] = [
    { key: 'name', header: 'Application', width: '260px' },
    { key: 'key', header: 'Key', width: '170px' },
    { key: 'productName', header: 'Product', width: '200px' },
    { key: 'type', header: 'Type', width: '104px' },
    { key: 'moduleCount', header: 'Modules', width: '100px', align: 'right' },
    { key: 'featureCount', header: 'Features', width: '100px', align: 'right', secondary: true },
    { key: 'permissionCount', header: 'Permissions', width: '124px', align: 'right', secondary: true },
    { key: 'status', header: 'Status', width: '120px' },
  ];

  readonly filters = computed<FilterDefinition[]>(() => [
    { key: 'productKey', label: 'Product', options: this.productOptions(), width: 200 },
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'Web', value: 'Web' },
        { label: 'API', value: 'API' },
        { label: 'Service', value: 'Service' },
        { label: 'Mobile', value: 'Mobile' },
        { label: 'Worker', value: 'Worker' },
      ],
      width: 140,
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Beta', value: 'Beta' },
        { label: 'Deprecated', value: 'Deprecated' },
        { label: 'Maintenance', value: 'Maintenance' },
      ],
      width: 150,
    },
  ]);

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((application) => {
      if (term) {
        const haystack = `${application.name} ${application.key} ${application.productName} ${application.baseUrl}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters['productKey'] && application.productKey !== filters['productKey']) return false;
      if (filters['type'] && application.type !== filters['type']) return false;
      if (filters['status'] && application.status !== filters['status']) return false;
      return true;
    });
  });

  readonly modules = computed(() => this.selected()?.modules ?? []);
  readonly features = computed(() => this.modules().flatMap((module) => module.features));
  readonly permissions = computed(() => this.features().flatMap((feature) => feature.permissions));

  readonly applicationRoles = computed(() =>
    this.allRoles().filter((role) => role.applicationKey === this.selected()?.key),
  );

  readonly applicationFlags = computed(() =>
    this.allFlags().filter((flag) => flag.applicationKey === this.selected()?.key),
  );

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'modules', label: 'Modules', count: this.modules().length },
    { key: 'features', label: 'Features', count: this.features().length },
    { key: 'permissions', label: 'Permissions', count: this.permissions().length },
    { key: 'roles', label: 'Roles', count: this.applicationRoles().length },
    { key: 'flags', label: 'Feature Flags', count: this.applicationFlags().length },
  ]);

  readonly overviewItems = computed<DefinitionItem[]>(() => {
    const application = this.selected();
    if (!application) return [];
    return [
      { label: 'Application ID', value: application.id, mono: true },
      { label: 'Key', value: application.key, mono: true },
      { label: 'Product', value: application.productName },
      { label: 'Type', value: application.type },
      { label: 'Version', value: application.version },
      { label: 'Status', value: application.status },
      { label: 'Base URL', value: application.baseUrl, mono: true },
      {
        label: 'Created',
        value: new Date(application.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    ];
  });

  constructor() {
    this.applications.all().subscribe((applications) => {
      this.rows.set(applications);
      this.loading.set(false);
    });
    this.products.all().subscribe((products) =>
      this.productOptions.set(products.map((product) => ({ label: product.name, value: product.key }))),
    );
    this.roles.all().subscribe((roles) => this.allRoles.set(roles));
    this.security.featureFlags().subscribe((result) => this.allFlags.set(result.items));
  }

  onFilterChange(change: { key: string; value: string | null }): void {
    this.filterValues.update((current) => ({ ...current, [change.key]: change.value }));
  }

  clearFilters(): void {
    this.filterValues.set({});
  }

  open(application: Application): void {
    this.selected.set(application);
    this.activeTab.set('overview');
    this.drawerOpen.set(true);
  }

  moduleNameFor(moduleId: string): string {
    return this.modules().find((module) => module.id === moduleId)?.name ?? '—';
  }

  featureNameFor(featureId: string): string {
    return this.features().find((feature) => feature.id === featureId)?.name ?? '—';
  }

  createApplication(): void {
    this.notifications.info('Register application', 'Application registration is enabled during API integration.');
  }
}
