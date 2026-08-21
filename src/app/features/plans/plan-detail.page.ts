import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuditEvent, Plan, Subscription } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService, PlansService, SubscriptionsService } from '../../core/services/data-contracts';
import {
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

@Component({
  selector: 'ctv-plan-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    DefinitionListComponent,
    TabNavComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    RelativeTimePipe,
  ],
  templateUrl: './plan-detail.page.html',
  styleUrl: './plan-detail.page.scss',
})
export class PlanDetailPage {
  private readonly plans = inject(PlansService);
  private readonly subscriptions = inject(SubscriptionsService);
  private readonly audit = inject(AuditService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>('');

  readonly plan = signal<Plan | null>(null);
  readonly loading = signal(true);
  readonly activeTab = signal('overview');
  readonly allSubscriptions = signal<Subscription[]>([]);
  readonly auditEvents = signal<AuditEvent[]>([]);

  readonly planSubscriptions = computed(() =>
    this.allSubscriptions().filter((subscription) => subscription.planId === this.plan()?.id),
  );

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'versions', label: 'Versions', count: this.plan()?.versions.length ?? 0 },
    { key: 'entitlements', label: 'Entitlements', count: this.plan()?.entitlements.length ?? 0 },
    { key: 'subscriptions', label: 'Subscriptions', count: this.planSubscriptions().length },
    { key: 'audit', label: 'Audit' },
  ]);

  readonly overviewItems = computed<DefinitionItem[]>(() => {
    const plan = this.plan();
    if (!plan) return [];
    return [
      { label: 'Plan ID', value: plan.id, mono: true },
      { label: 'Plan key', value: plan.key, mono: true },
      { label: 'Product', value: plan.productName },
      { label: 'Tier', value: plan.tier },
      { label: 'Current version', value: `v${plan.currentVersion}` },
      { label: 'Status', value: plan.status },
      { label: 'Base seats', value: String(plan.baseSeats) },
      { label: 'Price per seat', value: `${plan.currency} ${plan.pricePerSeat}` },
      { label: 'Billing cycle', value: plan.billingCycle },
      { label: 'Subscriptions', value: String(plan.subscriptionCount) },
    ];
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.loading.set(true);
      this.plans.byId(id).subscribe((plan) => {
        this.plan.set(plan ?? null);
        this.loading.set(false);
      });
    });

    this.subscriptions.all().subscribe((rows) => this.allSubscriptions.set(rows));
    this.audit.list({ pageSize: 10, page: 1 }).subscribe((result) => this.auditEvents.set(result.items));
  }

  back(): void {
    void this.router.navigate(['/app/plans']);
  }

  createVersion(): void {
    const plan = this.plan();
    if (!plan) return;
    this.notifications.success('Draft version created', `${plan.productName} ${plan.name} v3.1 is now a draft.`);
  }

  publish(versionId: string): void {
    const plan = this.plan();
    if (!plan) return;
    const versions = plan.versions.map((version) =>
      version.id === versionId ? { ...version, status: 'Published' as const } : version,
    );
    this.plan.set({ ...plan, versions });
    this.notifications.success('Version published', 'The plan version is now the active commercial definition.');
  }
}
