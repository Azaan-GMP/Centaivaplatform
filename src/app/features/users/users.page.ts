import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, timeout } from 'rxjs';
import { PlatformUser, SelectOption } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { UsersService } from '../../core/services/data-contracts';
import { DirectoryOptionDto, UsersDirectoryApiService } from '../../core/services/users-directory-api.service';
import {
  ColumnDef,
  ConfirmDialogComponent,
  DataTableComponent,
  DataTableToolbarComponent,
  EntityAvatarComponent,
  FilterDefinition,
  PageHeaderComponent,
  RelativeTimePipe,
  RowActionsComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    TooltipModule,
    PageHeaderComponent,
    SectionCardComponent,
    DataTableComponent,
    DataTableToolbarComponent,
    EntityAvatarComponent,
    StatusBadgeComponent,
    RowActionsComponent,
    ConfirmDialogComponent,
    RelativeTimePipe,
  ],
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage {
  private readonly users = inject(UsersService);
  private readonly directory = inject(UsersDirectoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(true);
  readonly rows = signal<PlatformUser[]>([]);
  readonly search = signal('');
  readonly filterValues = signal<Record<string, string | null>>({});

  readonly createOpen = signal(false);
  readonly confirmOpen = signal(false);
  readonly pendingUser = signal<PlatformUser | null>(null);
  readonly saving = signal(false);

  private readonly organizationList = signal<DirectoryOptionDto[]>([]);
  private readonly tenantList = signal<DirectoryOptionDto[]>([]);
  private readonly productOptions = signal<SelectOption[]>([]);

  readonly columns: ColumnDef[] = [
    { key: 'displayName', header: 'User', width: '260px' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', width: '116px' },
    { key: 'organizations.length', header: 'Orgs', width: '78px', align: 'right', secondary: true, sortable: false },
    { key: 'tenants.length', header: 'Tenants', width: '86px', align: 'right', secondary: true, sortable: false },
    { key: 'productKeys.length', header: 'Products', width: '96px', secondary: true, sortable: false },
    { key: 'mfa', header: 'MFA', width: '106px' },
    { key: 'lastSignInAt', header: 'Last Sign In', width: '132px' },
    { key: 'createdAt', header: 'Created', width: '116px', secondary: true },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    temporaryPassword: ['', Validators.minLength(8)],
    organizationId: ['', Validators.required],
    tenantId: ['', Validators.required],
    role: ['USER', Validators.required],
  });

  readonly roleOptions: SelectOption[] = [
    { label: 'User', value: 'USER' },
    { label: 'Tenant Admin', value: 'TENANT_ADMIN' },
  ];

  readonly organizationOptions = computed<SelectOption[]>(() =>
    this.organizationList().map((organization) => ({ label: organization.name, value: organization.id })),
  );

  readonly tenantOptions = computed<SelectOption[]>(() =>
    this.tenantList().map((tenant) => ({ label: tenant.name, value: tenant.id })),
  );

  readonly filters = computed<FilterDefinition[]>(() => [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Disabled', value: 'Disabled' },
        { label: 'Invited', value: 'Invited' },
        { label: 'Suspended', value: 'Suspended' },
      ],
      width: 132,
    },
    { key: 'organizationIds', label: 'Organization', options: this.organizationOptions(), width: 200 },
    { key: 'tenantIds', label: 'Tenant', options: this.tenantOptions(), width: 200 },
    { key: 'productKeys', label: 'Product', options: this.productOptions(), width: 190 },
  ]);

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((user) => {
      if (term) {
        const haystack = `${user.displayName} ${user.email} ${user.jobTitle} ${user.primaryRole}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }
      if (filters['status'] && user.status !== filters['status']) return false;
      if (filters['organizationIds'] && !user.organizationIds.includes(filters['organizationIds'])) return false;
      if (filters['tenantIds'] && !user.tenantIds.includes(filters['tenantIds'])) return false;
      if (filters['productKeys'] && !user.productKeys.includes(filters['productKeys'])) return false;
      return true;
    });
  });

  readonly summary = computed(() => {
    const all = this.rows();
    return {
      total: all.length,
      active: all.filter((user) => user.status === 'Active').length,
      invited: all.filter((user) => user.status === 'Invited').length,
      mfaEnabled: all.filter((user) => user.mfa === 'Enabled' || user.mfa === 'Enforced').length,
    };
  });

  constructor() {
    this.users.all().subscribe((users) => {
      this.rows.set(users);
      this.loading.set(false);
    });
    this.directory.organizations().subscribe((organizations) => this.organizationList.set(organizations));
    this.directory.tenants().subscribe((tenants) => this.tenantList.set(tenants));
    this.directory.products().subscribe((products) =>
      this.productOptions.set(products.map((product) => ({ label: product.name, value: product.key }))),
    );
    this.form.controls.organizationId.valueChanges.subscribe((organizationId) => {
      this.form.controls.tenantId.setValue('');
      this.directory.tenants(organizationId || undefined).subscribe((tenants) => this.tenantList.set(tenants));
    });
  }

  onFilterChange(change: { key: string; value: string | null }): void {
    this.filterValues.update((current) => ({ ...current, [change.key]: change.value }));
  }

  clearFilters(): void {
    this.filterValues.set({});
  }

  open(user: PlatformUser): void {
    void this.router.navigate(['/app/users', user.id]);
  }

  rowMenu(user: PlatformUser): MenuItem[] {
    return [
      { label: 'View', icon: 'pi pi-eye', command: () => this.open(user) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.notifications.info('Edit user', `${user.displayName} would open the edit form.`) },
      { label: 'Reset password', icon: 'pi pi-key', command: () => this.notifications.success('Reset link sent', `A password reset link was queued for ${user.email}.`) },
      { separator: true },
      user.status === 'Disabled'
        ? { label: 'Enable', icon: 'pi pi-check-circle', command: () => this.setStatus(user, 'Active') }
        : { label: 'Disable', icon: 'pi pi-ban', styleClass: 'menu-item-danger', command: () => this.askDisable(user) },
    ];
  }

  askDisable(user: PlatformUser): void {
    this.pendingUser.set(user);
    this.confirmOpen.set(true);
  }

  confirmDisable(): void {
    const user = this.pendingUser();
    if (!user) return;
    this.setStatus(user, 'Disabled');
    this.pendingUser.set(null);
  }

  private setStatus(user: PlatformUser, status: PlatformUser['status']): void {
    this.users.setStatus(user.id, status).subscribe(() => {
      this.rows.update((users) => users.map((row) => (row.id === user.id ? { ...row, status } : row)));
      this.notifications.success(`User ${status.toLowerCase()}`, `${user.displayName} is now ${status.toLowerCase()}.`);
    });
  }

  openCreate(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      temporaryPassword: '',
      role: 'USER',
      organizationId: this.organizationOptions()[0]?.value ?? '',
      tenantId: '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.createOpen.set(true);
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.users
      .createTenantUser(value.tenantId, {
        displayName: `${value.firstName} ${value.lastName}`,
        email: value.email,
        temporaryPassword: value.temporaryPassword || undefined,
        applicationKey: 'WORKWELL_FINANCE',
        roleKey: value.role,
      })
      .pipe(
        timeout(30000),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.rows.update((users) => [user, ...users]);
          this.createOpen.set(false);
          this.notifications.success('User created', `${user.email} was added to the selected tenant.`);
        },
        error: (error: unknown) => {
          const detail = this.createErrorMessage(error);
          this.notifications.error('Could not create tenant user', detail);
        },
      });
  }

  private createErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const response = error as {
        name?: string;
        error?: { error_description?: string; detail?: string; message?: string } | string;
        message?: string;
      };

      if (response.name === 'TimeoutError') {
        return 'The server did not respond within 30 seconds. Please verify the QA API and try again.';
      }

      if (typeof response.error === 'string' && response.error.trim()) return response.error;
      if (typeof response.error === 'object' && response.error !== null) {
        return response.error.error_description ?? response.error.detail ?? response.error.message ?? 'The API rejected the request.';
      }
      if (response.message) return response.message;
    }

    return 'The API rejected the request. Check the browser Network response for details.';
  }

  invalid(control: 'firstName' | 'lastName' | 'email' | 'organizationId'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }
}
