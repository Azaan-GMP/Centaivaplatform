import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Organization, SelectOption, Tenant } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { OrganizationsService, ProductsService, TenantsService } from '../../core/services/data-contracts';
import {
  ColumnDef,
  DataTableComponent,
  DataTableToolbarComponent,
  EntityAvatarComponent,
  FilterDefinition,
  MetricProgressComponent,
  PageHeaderComponent,
  RowActionsComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-tenants-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    MultiSelectModule,
    TooltipModule,
    PageHeaderComponent,
    SectionCardComponent,
    DataTableComponent,
    DataTableToolbarComponent,
    EntityAvatarComponent,
    StatusBadgeComponent,
    MetricProgressComponent,
    RowActionsComponent,
  ],
  templateUrl: './tenants.page.html',
  styleUrl: './tenants.page.scss',
})
export class TenantsPage {
  private readonly tenants = inject(TenantsService);
  private readonly organizations = inject(OrganizationsService);
  private readonly products = inject(ProductsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly rows = signal<Tenant[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly filterValues = signal<Record<string, string | null>>({});
  readonly createOpen = signal(false);
  readonly saving = signal(false);

  private readonly organizationList = signal<Organization[]>([]);
  readonly productOptions = signal<SelectOption[]>([]);

  readonly columns: ColumnDef[] = [
    { key: 'name', header: 'Tenant', width: '250px' },
    { key: 'key', header: 'Key', width: '150px' },
    { key: 'organizationName', header: 'Organization' },
    { key: 'productKeys.length', header: 'Products', width: '120px', sortable: false, secondary: true },
    { key: 'memberCount', header: 'Members', width: '96px', align: 'right' },
    { key: 'region', header: 'Region', width: '110px', secondary: true },
    { key: 'environment', header: 'Environment', width: '124px' },
    { key: 'status', header: 'Status', width: '124px' },
    { key: 'createdAt', header: 'Created', width: '116px', secondary: true },
  ];

  readonly organizationOptions = computed<SelectOption[]>(() =>
    this.organizationList().map((organization) => ({ label: organization.name, value: organization.id })),
  );

  readonly regionOptions: SelectOption[] = [
    { label: 'UK South', value: 'UK South' },
    { label: 'UK West', value: 'UK West' },
    { label: 'EU West', value: 'EU West' },
    { label: 'US East', value: 'US East' },
  ];

  readonly environmentOptions: SelectOption[] = [
    { label: 'Development', value: 'Development' },
    { label: 'QA', value: 'QA' },
    { label: 'Staging', value: 'Staging' },
    { label: 'Production', value: 'Production' },
  ];

  readonly filters = computed<FilterDefinition[]>(() => [
    { key: 'organizationId', label: 'Organization', options: this.organizationOptions(), width: 210 },
    { key: 'productKeys', label: 'Product', options: this.productOptions(), width: 190 },
    { key: 'region', label: 'Region', options: this.regionOptions, width: 140 },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Provisioning', value: 'Provisioning' },
        { label: 'Suspended', value: 'Suspended' },
        { label: 'Archived', value: 'Archived' },
      ],
      width: 150,
    },
  ]);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    key: ['', Validators.required],
    slug: [''],
    organizationId: ['', Validators.required],
    region: ['UK South', Validators.required],
    environment: ['Production', Validators.required],
    productKeys: [[] as string[]],
  });

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((tenant) => {
      if (term) {
        const haystack = `${tenant.name} ${tenant.key} ${tenant.organizationName} ${tenant.primaryContact}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters['organizationId'] && tenant.organizationId !== filters['organizationId']) return false;
      if (filters['productKeys'] && !tenant.productKeys.includes(filters['productKeys'])) return false;
      if (filters['region'] && tenant.region !== filters['region']) return false;
      if (filters['status'] && tenant.status !== filters['status']) return false;
      return true;
    });
  });

  readonly summary = computed(() => {
    const all = this.rows();
    const seats = all.reduce((total, tenant) => total + tenant.licenseSeats, 0);
    const used = all.reduce((total, tenant) => total + tenant.licenseSeatsUsed, 0);
    return {
      total: all.length,
      active: all.filter((tenant) => tenant.status === 'Active').length,
      provisioning: all.filter((tenant) => tenant.status === 'Provisioning').length,
      seats,
      used,
      members: all.reduce((total, tenant) => total + tenant.memberCount, 0),
    };
  });

  constructor() {
    this.tenants.all().subscribe((tenants) => {
      this.rows.set(tenants);
      this.loading.set(false);
    });
    this.organizations.all().subscribe((organizations) => this.organizationList.set(organizations));
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

  open(tenant: Tenant): void {
    void this.router.navigate(['/app/tenants', tenant.id]);
  }

  rowMenu(tenant: Tenant): MenuItem[] {
    return [
      { label: 'View', icon: 'pi pi-eye', command: () => this.open(tenant) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.notifications.info('Edit tenant', `${tenant.name} would open the edit form.`) },
      { label: 'Provision', icon: 'pi pi-bolt', command: () => this.notifications.info('Provisioning queued', `A provisioning run was queued for ${tenant.name}.`) },
      { separator: true },
      {
        label: tenant.status === 'Suspended' ? 'Reactivate' : 'Suspend',
        icon: tenant.status === 'Suspended' ? 'pi pi-play' : 'pi pi-pause',
        styleClass: tenant.status === 'Suspended' ? undefined : 'menu-item-danger',
        command: () => this.toggleStatus(tenant),
      },
    ];
  }

  private toggleStatus(tenant: Tenant): void {
    const status: Tenant['status'] = tenant.status === 'Suspended' ? 'Active' : 'Suspended';
    this.tenants.update(tenant.id, { status }).subscribe(() => {
      this.rows.update((rows) => rows.map((row) => (row.id === tenant.id ? { ...row, status } : row)));
      this.notifications.success(`Tenant ${status.toLowerCase()}`, `${tenant.name} is now ${status.toLowerCase()}.`);
    });
  }

  openCreate(): void {
    this.form.reset({
      region: 'UK South',
      environment: 'Production',
      productKeys: [],
      organizationId: this.organizationOptions()[0]?.value ?? '',
    });
    this.createOpen.set(true);
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const organization = this.organizationList().find((candidate) => candidate.id === value.organizationId);

    this.tenants
      .create({
        name: value.name,
        key: value.key,
        slug: value.slug || value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        organizationId: value.organizationId,
        organizationName: organization?.name ?? 'Unknown',
        region: value.region as Tenant['region'],
        environment: value.environment as Tenant['environment'],
        productKeys: value.productKeys,
      })
      .subscribe((tenant) => {
        this.rows.update((rows) => [tenant, ...rows]);
        this.saving.set(false);
        this.createOpen.set(false);
        this.notifications.success('Tenant created', `${tenant.name} is provisioning in ${tenant.region}.`);
      });
  }

  invalid(control: 'name' | 'key' | 'organizationId'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }
}
