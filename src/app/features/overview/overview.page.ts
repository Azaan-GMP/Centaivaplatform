import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuditEvent, HealthSignal, KpiMetric, ProvisioningRun, TrendPoint } from '../../core/models';
import { QUICK_ACTIONS } from '../../core/layout/navigation';
import { NotificationService } from '../../core/services/notification.service';
import {
  AuditService,
  PlatformService,
  ProvisioningService,
} from '../../core/services/data-contracts';
import {
  DonutChartComponent,
  EntityAvatarComponent,
  HealthTileComponent,
  LineChartComponent,
  MetricProgressComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '../../shared';

@Component({
  selector: 'ctv-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    StatCardComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    HealthTileComponent,
    LineChartComponent,
    DonutChartComponent,
    MetricProgressComponent,
    EntityAvatarComponent,
    RelativeTimePipe,
  ],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss',
})
export class OverviewPage {
  private readonly platform = inject(PlatformService);
  private readonly audit = inject(AuditService);
  private readonly provisioning = inject(ProvisioningService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly quickActions = QUICK_ACTIONS;

  readonly loading = signal(true);
  readonly kpis = signal<KpiMetric[]>([]);
  readonly health = signal<HealthSignal[]>([]);
  readonly tenantGrowth = signal<TrendPoint[]>([]);
  readonly userGrowth = signal<TrendPoint[]>([]);
  readonly subscriptionDistribution = signal<TrendPoint[]>([]);
  readonly licenseUtilization = signal<{ label: string; used: number; total: number }[]>([]);
  readonly activity = signal<AuditEvent[]>([]);
  readonly runs = signal<ProvisioningRun[]>([]);

  constructor() {
    this.platform.overview().subscribe((overview) => {
      this.kpis.set(overview.kpis);
      this.health.set(overview.health);
      this.tenantGrowth.set(overview.tenantGrowth);
      this.userGrowth.set(overview.userGrowth);
      this.subscriptionDistribution.set(overview.subscriptionDistribution);
      this.licenseUtilization.set(overview.licenseUtilization);
      this.loading.set(false);
    });

    this.audit.recent(8).subscribe((events) => this.activity.set(events));
    this.provisioning.runs({ pageSize: 5, page: 1 }).subscribe((result) => this.runs.set(result.items));
  }

  runQuickAction(route: string, label: string): void {
    void this.router.navigate([route], { queryParams: { create: 1 } });
    this.notifications.info(label, 'Opened the creation flow for this resource.');
  }

  utilizationPercent(entry: { used: number; total: number }): number {
    return Math.round((entry.used / entry.total) * 100);
  }
}
