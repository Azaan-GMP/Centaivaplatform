import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {
  AuditEvent,
  Entitlement,
  License,
  Subscription,
  Tenant,
  TenantIntegration,
} from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import {
  AuditService,
  IntegrationsService,
  LicensesService,
  PlansService,
  SubscriptionsService,
  TenantsService,
} from '../../core/services/data-contracts';
import {
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  EntityAvatarComponent,
  LoadingSkeletonComponent,
  MaskedValueComponent,
  MetricProgressComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

@Component({
  selector: 'ctv-tenant-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    ToggleSwitchModule,
    InputNumberModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    EntityAvatarComponent,
    DefinitionListComponent,
    MetricProgressComponent,
    MaskedValueComponent,
    TabNavComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    RelativeTimePipe,
  ],
  templateUrl: './tenant-detail.page.html',
  styleUrl: './tenant-detail.page.scss',
})
export class TenantDetailPage {
  private readonly tenants = inject(TenantsService);
  private readonly subscriptions = inject(SubscriptionsService);
  private readonly licenses = inject(LicensesService);
  private readonly plans = inject(PlansService);
  private readonly integrations = inject(IntegrationsService);
  private readonly audit = inject(AuditService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly id = input<string>('');

  readonly tenant = signal<Tenant | null>(null);
  readonly loading = signal(true);
  readonly activeTab = signal('overview');

  readonly allSubscriptions = signal<Subscription[]>([]);
  readonly allLicenses = signal<License[]>([]);
  readonly entitlements = signal<Entitlement[]>([]);
  readonly tenantIntegrations = signal<TenantIntegration[]>([]);
  readonly auditEvents = signal<AuditEvent[]>([]);

  readonly policyForm = this.formBuilder.nonNullable.group({
    requireMfa: [true],
    allowPasswordLogin: [true],
    allowExternalIdentityProviders: [true],
    sessionTimeoutMinutes: [120],
    maxFailedAttempts: [5],
    minimumPasswordLength: [12],
    requireVerifiedEmail: [true],
  });

  readonly tenantSubscriptions = computed(() =>
    this.allSubscriptions().filter((subscription) => subscription.tenantId === this.tenant()?.id),
  );

  readonly tenantLicenses = computed(() =>
    this.allLicenses().filter((license) => license.tenantId === this.tenant()?.id),
  );

  readonly tenantEntitlements = computed(() => {
    const tenant = this.tenant();
    if (!tenant) return [];
    return this.entitlements().filter(
      (entitlement) =>
        tenant.productKeys.includes(entitlement.productKey) || entitlement.productKey === 'CENTAIVA_PLATFORM',
    );
  });

  readonly integrationRows = computed(() =>
    this.tenantIntegrations().filter((row) => row.tenantId === this.tenant()?.id),
  );

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members', count: this.tenant()?.members.length ?? 0 },
    { key: 'products', label: 'Products', count: this.tenant()?.products.length ?? 0 },
    { key: 'subscriptions', label: 'Subscriptions', count: this.tenantSubscriptions().length },
    { key: 'licenses', label: 'Licenses', count: this.tenantLicenses().length },
    { key: 'entitlements', label: 'Entitlements', count: this.tenantEntitlements().length },
    { key: 'routing', label: 'Data Routing', count: this.tenant()?.dataRoutes.length ?? 0 },
    { key: 'integrations', label: 'Integrations', count: this.integrationRows().length },
    { key: 'security', label: 'Security' },
    { key: 'audit', label: 'Audit' },
  ]);

  readonly overviewCards = computed<DefinitionItem[]>(() => {
    const tenant = this.tenant();
    if (!tenant) return [];
    return [
      { label: 'Tenant ID', value: tenant.id, mono: true },
      { label: 'Key', value: tenant.key, mono: true },
      { label: 'Organization', value: tenant.organizationName },
      { label: 'Region', value: tenant.region },
      { label: 'Environment', value: tenant.environment },
      { label: 'Users', value: String(tenant.memberCount) },
      { label: 'Products', value: String(tenant.productKeys.length) },
      { label: 'Subscription Status', value: tenant.subscriptionStatus },
      {
        label: 'License Utilization',
        value: `${tenant.licenseSeatsUsed} / ${tenant.licenseSeats} seats`,
      },
      { label: 'Primary contact', value: tenant.primaryContact },
    ];
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.loading.set(true);
      this.tenants.byId(id).subscribe((tenant) => {
        this.tenant.set(tenant ?? null);
        this.loading.set(false);
        if (tenant) {
          this.policyForm.patchValue(tenant.securityPolicy);
        }
      });
    });

    this.subscriptions.all().subscribe((rows) => this.allSubscriptions.set(rows));
    this.licenses.all().subscribe((rows) => this.allLicenses.set(rows));
    this.plans.entitlements().subscribe((rows) => this.entitlements.set(rows));
    this.integrations.tenantIntegrations().subscribe((result) => this.tenantIntegrations.set(result.items));
    this.audit.list({ pageSize: 10, page: 1 }).subscribe((result) => this.auditEvents.set(result.items));
  }

  back(): void {
    void this.router.navigate(['/app/tenants']);
  }

  action(summary: string, detail: string): void {
    this.notifications.success(summary, detail);
  }

  savePolicy(): void {
    const tenant = this.tenant();
    if (!tenant) return;

    const value = this.policyForm.getRawValue();
    this.tenants.update(tenant.id, { securityPolicy: value }).subscribe(() => {
      this.tenant.set({ ...tenant, securityPolicy: value });
      this.notifications.success('Security policy saved', `Authentication policy updated for ${tenant.name}.`);
    });
  }

  entitlementValueFor(entitlement: Entitlement): string {
    return entitlement.valueType === 'Boolean'
      ? entitlement.defaultValue === 'true'
        ? 'Enabled'
        : 'Disabled'
      : `${entitlement.defaultValue}${entitlement.unit ? ' ' + entitlement.unit : ''}`;
  }
}
