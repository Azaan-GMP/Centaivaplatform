import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Plan, SelectOption } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { PlansService, ProductsService } from '../../core/services/data-contracts';
import {
  DataTableToolbarComponent,
  FilterDefinition,
  PageHeaderComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-plans-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, SectionCardComponent, StatusBadgeComponent, DataTableToolbarComponent],
  templateUrl: './plans.page.html',
  styleUrl: './plans.page.scss',
})
export class PlansPage {
  private readonly plans = inject(PlansService);
  private readonly products = inject(ProductsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly rows = signal<Plan[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly filterValues = signal<Record<string, string | null>>({});
  readonly productOptions = signal<SelectOption[]>([]);

  readonly filters = computed<FilterDefinition[]>(() => [
    { key: 'productKey', label: 'Product', options: this.productOptions(), width: 200 },
    {
      key: 'tier',
      label: 'Tier',
      options: [
        { label: 'Starter', value: 'Starter' },
        { label: 'Professional', value: 'Professional' },
        { label: 'Business', value: 'Business' },
        { label: 'Enterprise', value: 'Enterprise' },
      ],
      width: 160,
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Retired', value: 'Retired' },
      ],
      width: 140,
    },
  ]);

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const filters = this.filterValues();

    return this.rows().filter((plan) => {
      if (term && !`${plan.name} ${plan.key} ${plan.productName} ${plan.description}`.toLowerCase().includes(term)) {
        return false;
      }
      if (filters['productKey'] && plan.productKey !== filters['productKey']) return false;
      if (filters['tier'] && plan.tier !== filters['tier']) return false;
      if (filters['status'] && plan.status !== filters['status']) return false;
      return true;
    });
  });

  /** Grouped by product so the card wall reads like a pricing matrix. */
  readonly grouped = computed(() => {
    const groups = new Map<string, Plan[]>();
    for (const plan of this.filtered()) {
      const list = groups.get(plan.productName) ?? [];
      list.push(plan);
      groups.set(plan.productName, list);
    }
    return [...groups.entries()].map(([productName, plans]) => ({
      productName,
      plans: plans.sort((a, b) => a.baseSeats - b.baseSeats),
    }));
  });

  readonly totals = computed(() => {
    const all = this.rows();
    return {
      plans: all.length,
      published: all.filter((plan) => plan.status === 'Active').length,
      drafts: all.reduce((count, plan) => count + plan.versions.filter((version) => version.status === 'Draft').length, 0),
      subscriptions: all.reduce((count, plan) => count + plan.subscriptionCount, 0),
    };
  });

  constructor() {
    this.plans.all().subscribe((plans) => {
      this.rows.set(plans);
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

  view(plan: Plan): void {
    void this.router.navigate(['/app/plans', plan.id]);
  }

  edit(plan: Plan, event: Event): void {
    event.stopPropagation();
    this.notifications.info('Edit plan', `${plan.productName} ${plan.name} would open the edit form.`);
  }

  createVersion(plan: Plan, event: Event): void {
    event.stopPropagation();
    this.notifications.success('Draft version created', `${plan.productName} ${plan.name} v3.0 was created as a draft.`);
  }

  createPlan(): void {
    this.notifications.info('Create plan', 'Plan authoring is enabled during API integration.');
  }
}
