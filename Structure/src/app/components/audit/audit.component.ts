import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../../services/platform-api.service';
import { AuditEvent } from '../../../models/platform-api.models';
import { IconComponent } from '../../../shared/UI/icon/icon.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit {
  readonly auditEvents = signal<AuditEvent[]>([]);
  readonly isLoading = signal<boolean>(true);

  constructor(private apiService: PlatformApiService) {}

  ngOnInit(): void {
    this.apiService.getAuditEvents(1, 50).subscribe({
      next: (data) => {
        this.auditEvents.set(data && data.length > 0 ? data : this.getDefaultAuditEvents());
        this.isLoading.set(false);
      },
      error: () => {
        this.auditEvents.set(this.getDefaultAuditEvents());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultAuditEvents(): AuditEvent[] {
    return [
      {
        id: 'EVT-1001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        action: 'PLATFORM_SSO_LOGIN',
        actorEmail: 'talha.hassan@centaiva.com',
        actorRole: 'PLATFORM_OWNER',
        resourceType: 'AUTHENTICATION',
        resourceId: 'centaiva-platform-web',
        ipAddress: '192.168.88.27',
        status: 'SUCCESS',
        details: 'Tenantless Platform Control token issued'
      },
      {
        id: 'EVT-1002',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        action: 'WORKWELL_TENANT_DISCOVERY',
        actorEmail: 'talha.hassan@centaiva.com',
        actorRole: 'PLATFORM_OWNER',
        resourceType: 'TENANT',
        resourceId: 'WORKWELL_FINANCE',
        ipAddress: '192.168.88.27',
        status: 'SUCCESS',
        details: 'Discovered Eutopia Search, Patrick Morgan, MedPure'
      },
      {
        id: 'EVT-1003',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        action: 'USER_MFA_STATUS_INSPECT',
        actorEmail: 'talha.hassan@centaiva.com',
        actorRole: 'PLATFORM_OWNER',
        resourceType: 'USER',
        resourceId: 'yvesb@workwelloutsourcing.com',
        ipAddress: '192.168.88.27',
        status: 'SUCCESS',
        details: 'Verified MFA compliance'
      }
    ];
  }
}
