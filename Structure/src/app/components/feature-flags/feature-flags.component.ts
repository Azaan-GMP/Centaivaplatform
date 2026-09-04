import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../../services/platform-api.service';
import { FeatureFlag } from '../../../models/platform-api.models';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';

@Component({
  selector: 'app-feature-flags',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './feature-flags.component.html',
  styleUrls: ['./feature-flags.component.scss']
})
export class FeatureFlagsComponent implements OnInit {
  readonly featureFlags = signal<FeatureFlag[]>([]);
  readonly isLoading = signal<boolean>(true);

  constructor(
    private apiService: PlatformApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.apiService.getFeatureFlags(true).subscribe({
      next: (data) => {
        this.featureFlags.set(data && data.length > 0 ? data : this.getDefaultFlags());
        this.isLoading.set(false);
      },
      error: () => {
        this.featureFlags.set(this.getDefaultFlags());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultFlags(): FeatureFlag[] {
    return [
      { id: 'FLAG-01', key: 'ENABLE_WORKWELL_DELEGATED_ONBOARDING', name: 'WorkWell Delegated Onboarding', description: 'Enables automatic provisioning of child organizations into WorkWell local databases', isEnabled: true, scope: 'GLOBAL' },
      { id: 'FLAG-02', key: 'STRICT_SINGLE_TENANT_TOKEN_ENFORCEMENT', name: 'Strict Single-Tenant Token Isolation', description: 'Requires selectionCode exchange before issuing WORKWELL_FINANCE tokens', isEnabled: true, scope: 'GLOBAL' },
      { id: 'FLAG-03', key: 'MFA_ENFORCEMENT_PLATFORM_OWNERS', name: 'Mandatory MFA for Platform Owners', description: 'Prompts TOTP verification on all Central Control plane logins', isEnabled: true, scope: 'GLOBAL' },
      { id: 'FLAG-04', key: 'ADVANCED_FINANCE_ANALYTICS_V2', name: 'Financial Analytics Suite V2', description: 'Next-gen cross-tenant cash flow and revenue reporting dashboards', isEnabled: false, scope: 'TENANT' }
    ];
  }

  toggleFlag(flag: FeatureFlag): void {
    flag.isEnabled = !flag.isEnabled;
    this.toastr.success(`Feature flag ${flag.key} set to ${flag.isEnabled ? 'ENABLED' : 'DISABLED'}`);
  }
}
