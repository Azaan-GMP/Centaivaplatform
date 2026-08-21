import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Application,
  Deployment,
  Entitlement,
  Feature,
  Permission,
  Plan,
  Product,
  ProductModule,
  Subscription,
} from '../../core/models';
import {
  ApplicationsService,
  DeploymentsService,
  PlansService,
  ProductsService,
  SubscriptionsService,
} from '../../core/services/data-contracts';
import {
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  MetricProgressComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

@Component({
  selector: 'ctv-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    DefinitionListComponent,
    MetricProgressComponent,
    TabNavComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    RelativeTimePipe,
  ],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage {
  private readonly products = inject(ProductsService);
  private readonly applications = inject(ApplicationsService);
  private readonly plans = inject(PlansService);
  private readonly subscriptions = inject(SubscriptionsService);
  private readonly deployments = inject(DeploymentsService);
  private readonly router = inject(Router);

  readonly id = input<string>('');

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly activeTab = signal('overview');

  readonly productApplications = signal<Application[]>([]);
  readonly allPlans = signal<Plan[]>([]);
  readonly allEntitlements = signal<Entitlement[]>([]);
  readonly allSubscriptions = signal<Subscription[]>([]);
  readonly allDeployments = signal<Deployment[]>([]);

  readonly modules = computed<ProductModule[]>(() =>
    this.productApplications().flatMap((application) => application.modules),
  );

  readonly features = computed<Feature[]>(() => this.modules().flatMap((module) => module.features));

  readonly permissions = computed<Permission[]>(() =>
    this.features().flatMap((feature) => feature.permissions),
  );

  readonly productPlans = computed(() =>
    this.allPlans().filter((plan) => plan.productKey === this.product()?.key),
  );

  readonly productEntitlements = computed(() =>
    this.allEntitlements().filter((entitlement) => entitlement.productKey === this.product()?.key),
  );

  readonly productSubscriptions = computed(() =>
    this.allSubscriptions().filter((subscription) => subscription.productKey === this.product()?.key),
  );

  readonly productDeployments = computed(() =>
    this.allDeployments().filter((deployment) => deployment.productKey === this.product()?.key),
  );

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: 'Applications', count: this.productApplications().length },
    { key: 'modules', label: 'Modules', count: this.modules().length },
    { key: 'features', label: 'Features', count: this.features().length },
    { key: 'permissions', label: 'Permissions', count: this.permissions().length },
    { key: 'plans', label: 'Plans', count: this.productPlans().length },
    { key: 'entitlements', label: 'Entitlements', count: this.productEntitlements().length },
    { key: 'meters', label: 'Meters', count: this.product()?.meters.length ?? 0 },
    { key: 'subscriptions', label: 'Subscriptions', count: this.productSubscriptions().length },
    { key: 'deployments', label: 'Deployments', count: this.productDeployments().length },
  ]);

  readonly overviewItems = computed<DefinitionItem[]>(() => {
    const product = this.product();
    if (!product) return [];
    return [
      { label: 'Product ID', value: product.id, mono: true },
      { label: 'Key', value: product.key, mono: true },
      { label: 'Version', value: product.version },
      { label: 'Lifecycle', value: product.lifecycle },
      { label: 'Status', value: product.status },
      { label: 'Owner', value: product.owner },
      { label: 'Applications', value: String(product.applicationCount) },
      { label: 'Tenants', value: String(product.tenantCount) },
      { label: 'Subscriptions', value: String(product.subscriptionCount) },
      {
        label: 'Created',
        value: new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    ];
  });

  readonly seatPosition = computed(() => {
    const rows = this.productSubscriptions();
    return {
      used: rows.reduce((total, subscription) => total + subscription.seatsUsed, 0),
      total: rows.reduce((total, subscription) => total + subscription.seats, 0),
    };
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.loading.set(true);
      this.products.byId(id).subscribe((product) => {
        this.product.set(product ?? null);
        this.loading.set(false);
        if (product) {
          this.applications.byProduct(product.key).subscribe((rows) => this.productApplications.set(rows));
        }
      });
    });

    this.plans.all().subscribe((rows) => this.allPlans.set(rows));
    this.plans.entitlements().subscribe((rows) => this.allEntitlements.set(rows));
    this.subscriptions.all().subscribe((rows) => this.allSubscriptions.set(rows));
    this.deployments.all().subscribe((rows) => this.allDeployments.set(rows));
  }

  back(): void {
    void this.router.navigate(['/app/products']);
  }

  moduleNameFor(feature: Feature): string {
    return this.modules().find((module) => module.id === feature.moduleId)?.name ?? '—';
  }

  featureNameFor(permission: Permission): string {
    return this.features().find((feature) => feature.id === permission.featureId)?.name ?? '—';
  }
}
