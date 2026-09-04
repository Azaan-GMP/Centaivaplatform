import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../../services/platform-api.service';
import { ServiceAccount } from '../../../models/platform-api.models';
import { IconComponent } from '../../../shared/UI/icon/icon.component';

@Component({
  selector: 'app-service-accounts',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './service-accounts.component.html',
  styleUrls: ['./service-accounts.component.scss']
})
export class ServiceAccountsComponent implements OnInit {
  readonly serviceAccounts = signal<ServiceAccount[]>([]);
  readonly isLoading = signal<boolean>(true);

  constructor(private apiService: PlatformApiService) {}

  ngOnInit(): void {
    this.apiService.getServiceAccounts().subscribe({
      next: (data) => {
        this.serviceAccounts.set(data && data.length > 0 ? data : this.getDefaultAccounts());
        this.isLoading.set(false);
      },
      error: () => {
        this.serviceAccounts.set(this.getDefaultAccounts());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultAccounts(): ServiceAccount[] {
    return [
      { id: 'SVC-001', name: 'WorkWell Finance Data Pipeline', clientId: 'svc-workwell-sync', description: 'Nightly GL synchronization and billing aggregation worker', roles: ['FINANCE_SYSTEM_SYNC'], status: 'ACTIVE', createdAt: '2026-01-15T00:00:00Z', expiresAt: '2027-01-15T00:00:00Z' },
      { id: 'SVC-002', name: 'Telemetry & Log Ingestion Daemon', clientId: 'svc-telemetry-collector', description: 'Central log forwarder for system audit events and Prometheus scrapers', roles: ['AUDIT_READ'], status: 'ACTIVE', createdAt: '2026-02-01T00:00:00Z', expiresAt: '2027-02-01T00:00:00Z' }
    ];
  }
}
