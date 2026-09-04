import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../../services/platform-api.service';
import { Permission } from '../../../models/platform-api.models';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  readonly permissions = signal<Permission[]>([]);
  readonly isLoading = signal<boolean>(true);

  searchQuery = '';
  moduleFilter = 'ALL';
  sortBy = 'name'; // 'name' | 'key' | 'module'

  // Pagination State
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(6);

  readonly selectedPermission = signal<Permission | null>(null);

  readonly moduleOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Functional Modules' },
    { value: 'Governance', label: 'Governance & Orgs' },
    { value: 'Multi-Tenant', label: 'Multi-Tenant Partitions' },
    { value: 'Identity & Access', label: 'Identity & Access' },
    { value: 'WorkWell Finance', label: 'WorkWell Finance' },
    { value: 'Security & Audit', label: 'Security & Audit' }
  ];

  readonly sortOptions: SelectOption[] = [
    { value: 'name', label: 'Sort by Display Name' },
    { value: 'key', label: 'Sort by Key Identifier' },
    { value: 'module', label: 'Sort by Module Domain' }
  ];

  readonly filteredPermissions = computed(() => {
    let list = this.permissions();
    const q = this.searchQuery.toLowerCase().trim();
    const mod = this.moduleFilter;
    const sort = this.sortBy;

    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.module && p.module.toLowerCase().includes(q))
      );
    }

    if (mod !== 'ALL') {
      list = list.filter(p => p.module === mod);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'key') {
        return (a.key || '').localeCompare(b.key || '');
      } else if (sort === 'module') {
        return (a.module || '').localeCompare(b.module || '');
      }
      return 0;
    });

    return list;
  });

  readonly paginatedPermissions = computed(() => {
    const list = this.filteredPermissions();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredPermissions().length / this.pageSize());
  });

  readonly totalCount = computed(() => this.permissions().length);
  readonly modulesCount = computed(() => {
    const set = new Set(this.permissions().map(p => p.module).filter(Boolean));
    return set.size;
  });
  readonly governanceCount = computed(() => this.permissions().filter(p => p.module === 'Governance' || p.module === 'Multi-Tenant').length);
  readonly financeCount = computed(() => this.permissions().filter(p => p.module === 'WorkWell Finance').length);

  constructor(private apiService: PlatformApiService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading.set(true);
    this.apiService.getApplicationPermissions('1DECD47E-4A96-F111-80F8-00155D581206', true).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.permissions.set(data);
        } else {
          this.permissions.set(this.getDefaultPermissions());
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.permissions.set(this.getDefaultPermissions());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultPermissions(): Permission[] {
    return [
      {
        id: 'PRM-01',
        key: 'ORGANIZATIONS_READ',
        name: 'View Organization Directory',
        module: 'Governance',
        description: 'Read-only access to customer root entities, branch groupings, and company hierarchy metadata.'
      },
      {
        id: 'PRM-02',
        key: 'ORGANIZATIONS_WRITE',
        name: 'Create & Manage Organizations',
        module: 'Governance',
        description: 'Provision new parent organizations, edit company codes, and update organizational hierarchy bindings.'
      },
      {
        id: 'PRM-03',
        key: 'TENANTS_READ',
        name: 'View Tenant Partitions',
        module: 'Multi-Tenant',
        description: 'Access multi-tenant customer partitions, WorkWell CompId bridge mappings, and active member counts.'
      },
      {
        id: 'PRM-04',
        key: 'TENANTS_WRITE',
        name: 'Provision & Configure Tenants',
        module: 'Multi-Tenant',
        description: 'Provision isolated tenant partitions, bind WorkWell local company IDs, and configure isolation boundaries.'
      },
      {
        id: 'PRM-05',
        key: 'USERS_READ',
        name: 'Browse Platform Users Directory',
        module: 'Identity & Access',
        description: 'Search platform members, verify email identities, inspect assigned roles, and view active sessions.'
      },
      {
        id: 'PRM-06',
        key: 'USERS_MANAGE',
        name: 'Create & Edit User Profiles',
        module: 'Identity & Access',
        description: 'Invite new platform members, edit user roles, assign tenant partitions, and update security metadata.'
      },
      {
        id: 'PRM-07',
        key: 'USERS_SECURITY_RESET',
        name: 'Reset Passwords & MFA Credentials',
        module: 'Identity & Access',
        description: 'Perform sensitive administrative credential resets, revoke active session tokens, and trigger MFA enrollments.'
      },
      {
        id: 'PRM-08',
        key: 'ROLES_MANAGE',
        name: 'Manage RBAC Roles & Capabilities',
        module: 'Identity & Access',
        description: 'Define custom RBAC security roles, assign granular permissions, and scope application access boundaries.'
      },
      {
        id: 'PRM-09',
        key: 'FINANCE_ACCESS',
        name: 'WorkWell Finance Portal Entry',
        module: 'WorkWell Finance',
        description: 'Permits entry into WorkWell Finance client applications, general ledger dashboard, and accounting views.'
      },
      {
        id: 'PRM-10',
        key: 'FINANCE_TRANSACTIONS',
        name: 'Post Financial Journals & Invoices',
        module: 'WorkWell Finance',
        description: 'Authorize and execute accounting journal mutations, approve client invoices, and verify payroll relays.'
      },
      {
        id: 'PRM-11',
        key: 'INTEGRATIONS_MANAGE',
        name: 'Configure API Connectors & Bridges',
        module: 'Governance',
        description: 'Connect third-party webhook relays, rotate client secrets, and test live automated data synchronization.'
      },
      {
        id: 'PRM-12',
        key: 'AUDIT_VIEW',
        name: 'Inspect Security & Audit Logs',
        module: 'Security & Audit',
        description: 'Read immutable compliance telemetry, track user authentication events, and export system audit trails.'
      }
    ];
  }

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage.set(1);
  }

  onModuleChange(val: string): void {
    this.moduleFilter = val;
    this.currentPage.set(1);
  }

  onSortChange(val: string): void {
    this.sortBy = val;
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  viewPermission(perm: Permission): void {
    this.selectedPermission.set(perm);
  }

  closePermissionDetails(): void {
    this.selectedPermission.set(null);
  }
}
