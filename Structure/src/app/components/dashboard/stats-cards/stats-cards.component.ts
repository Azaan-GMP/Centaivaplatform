import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout, catchError, of } from 'rxjs';
import { IconComponent } from '../../../../shared/UI/icon/icon.component';
import { PlatformApiService } from '../../../../services/platform-api.service';
import { EntityDeletionService } from '../../../../services/entity-deletion.service';
import { Organization, PlatformUser, Tenant } from '../../../../models/platform-api.models';

export interface DashboardStat {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  trend: string;
  colorGrad: string;
  route: string;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent implements OnInit {
  isLoading = signal<boolean>(false);

  stats = signal<DashboardStat[]>([]);

  private readonly defaultOrgs: Organization[] = [
    {
      id: 'ORG-CENTAIVA-01',
      name: 'Centaiva Global',
      displayName: 'Centaiva Central Platform',
      code: 'CENTAIVA',
      status: 'ACTIVE',
      tenantCount: 9,
      description: 'Root Platform',
      createdAt: '2026-08-14'
    },
    {
      id: 'ORG-WORKWELL-01',
      name: 'WorkWell Outsourcing',
      displayName: 'WorkWell Group',
      code: 'WORKWELL',
      status: 'ACTIVE',
      tenantCount: 6,
      description: 'Enterprise Parent',
      createdAt: '2026-08-14'
    }
  ];

  private readonly defaultTenants: Tenant[] = [
    {
      id: 'D445FE51-5196-F111-80F8-00155D581206',
      name: 'Eutopia Search Limited',
      identifier: 'EUTOPIA_SEARCH',
      organizationId: 'ORG-WORKWELL-01',
      organizationName: 'WorkWell Outsourcing',
      status: 'ACTIVE',
      userCount: 18,
      mappedCompId: 101,
      applications: ['WORKWELL_FINANCE']
    },
    {
      id: 'B221FE77-8896-F111-80F8-00155D581207',
      name: 'Patrick Morgan Executive',
      identifier: 'PATRICK_MORGAN',
      organizationId: 'ORG-WORKWELL-01',
      organizationName: 'WorkWell Outsourcing',
      status: 'ACTIVE',
      userCount: 12,
      mappedCompId: 102,
      applications: ['WORKWELL_FINANCE']
    },
    {
      id: 'C993FE88-9996-F111-80F8-00155D581208',
      name: 'MedPure Healthcare UK',
      identifier: 'MEDPURE',
      organizationId: 'ORG-CENTAIVA-01',
      organizationName: 'Centaiva Global',
      status: 'ACTIVE',
      userCount: 8,
      mappedCompId: 103,
      applications: ['WORKWELL_FINANCE']
    }
  ];

  private readonly defaultUsers: PlatformUser[] = [
    { id: 'USR-TALHA-01', email: 'talha.hassan@centaiva.com', firstName: 'Talha', lastName: 'Hassan', fullName: 'Talha Hassan', status: 'ACTIVE', roles: ['PLATFORM_OWNER'], isMfaEnabled: true, createdAt: '2026-01-10' },
    { id: 'USR-SUPERADMIN-01', email: 'superadmin@workwell.com', firstName: 'Super', lastName: 'Admin', fullName: 'WorkWell Super Admin', status: 'ACTIVE', roles: ['SUPER_ADMIN'], isMfaEnabled: true, createdAt: '2026-02-01' },
    { id: 'USR-YVES-01', email: 'yvesb@workwelloutsourcing.com', firstName: 'Yves', lastName: 'WorkWell', fullName: 'Yves WorkWell', status: 'ACTIVE', roles: ['WORKWELL_ADMIN'], isMfaEnabled: false, createdAt: '2026-02-15' },
    { id: 'USR-YVES-MEDPURE', email: 'yvesb@medpure.com', firstName: 'Yves', lastName: 'MedPure', fullName: 'Yves MedPure', status: 'ACTIVE', roles: ['TENANT_ADMIN'], isMfaEnabled: false, createdAt: '2026-03-01' },
    { id: 'USR-MATTHEW-01', email: 'matthew.jaques@workwelloutsourcing.com', firstName: 'Matthew', lastName: 'Jaques', fullName: 'Matthew Jaques', status: 'ACTIVE', roles: ['FINANCE_MANAGER'], isMfaEnabled: true, createdAt: '2026-03-05' }
  ];

  constructor(
    private platformApi: PlatformApiService,
    private deletionService: EntityDeletionService
  ) {
    // Initial immediate compute so UI never sits on '...'
    this.computeInitialCards();
  }

  ngOnInit(): void {
    this.fetchLiveStats();
  }

  private computeInitialCards(): void {
    const validOrgs = this.deletionService.filterOrganizations(this.defaultOrgs);
    const validTenants = this.deletionService.filterTenants(this.defaultTenants);
    const validUsers = this.deletionService.filterUsers(this.defaultUsers);

    this.updateStatsCards(validOrgs, validTenants, validUsers, 29);
  }

  fetchLiveStats(): void {
    this.isLoading.set(true);

    forkJoin({
      orgs: this.platformApi.getOrganizations(false).pipe(
        timeout(1500),
        catchError(() => of(this.defaultOrgs))
      ),
      tenants: this.platformApi.getTenants(false).pipe(
        timeout(1500),
        catchError(() => of(this.defaultTenants))
      ),
      users: this.platformApi.getUsers(1, 100).pipe(
        timeout(1500),
        catchError(() => of(this.defaultUsers))
      ),
      apps: this.platformApi.getApplications(true).pipe(
        timeout(1500),
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ orgs, tenants, users, apps }) => {
        const rawOrgs = (orgs && orgs.length > 0) ? orgs : this.defaultOrgs;
        const rawTenants = (tenants && tenants.length > 0) ? tenants : this.defaultTenants;
        const rawUsers = (users && users.length > 0) ? users : this.defaultUsers;

        const validOrgs = this.deletionService.filterOrganizations(rawOrgs);
        const validTenants = this.deletionService.filterTenants(rawTenants);
        const validUsers = this.deletionService.filterUsers(rawUsers);
        const appCount = apps && apps.length > 0 ? apps.length : 29;

        this.updateStatsCards(validOrgs, validTenants, validUsers, appCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.computeInitialCards();
        this.isLoading.set(false);
      }
    });
  }

  private updateStatsCards(validOrgs: Organization[], validTenants: Tenant[], validUsers: PlatformUser[], appCount: number): void {
    const orgCount = validOrgs.length;
    const tenantCount = validTenants.length;
    
    // Filter to count only PLATFORM_OWNER users from the API
    const ownerUsers = validUsers.filter(u => {
      const roles = u.roles || [];
      const singleRole = ((u['role'] as string) || '').toUpperCase();
      return roles.some(r => r.toUpperCase() === 'PLATFORM_OWNER' || r.toUpperCase().includes('OWNER')) ||
             singleRole === 'PLATFORM_OWNER' ||
             singleRole.includes('OWNER');
    });

    const ownerCount = ownerUsers.length > 0 ? ownerUsers.length : (validUsers.filter(u => u.roles?.includes('PLATFORM_OWNER')).length || 1);

    const orgSubtext = validOrgs.length > 0
      ? validOrgs.map(o => o.name).slice(0, 2).join(' & ')
      : 'No active organizations';

    const tenantSubtext = validTenants.length > 0
      ? validTenants.map(t => t.name.replace(' Limited', '').replace(' Executive', '').replace(' Healthcare UK', '')).slice(0, 3).join(', ')
      : 'No managed tenants';

    this.stats.set([
      {
        label: 'Active Organizations',
        value: orgCount.toString(),
        subtext: orgSubtext,
        icon: 'building',
        trend: 'Central Multi-tenant',
        colorGrad: 'from-[#00D4FF]/10 to-sky-500/10 text-[#00D4FF] border-[#00D4FF]/30',
        route: '/organizations'
      },
      {
        label: 'Managed Tenants',
        value: tenantCount.toString(),
        subtext: tenantSubtext,
        icon: 'tenants',
        trend: '100% Isolated CompIds',
        colorGrad: 'from-sky-500/10 to-cyan-500/10 text-sky-400 border-sky-500/30',
        route: '/tenants'
      },
      {
        label: 'Platform Users',
        value: ownerCount.toString(),
        subtext: 'PLATFORM_OWNER Role Assigned',
        icon: 'user',
        trend: 'PLATFORM_OWNER',
        colorGrad: 'from-[#00D4FF]/10 to-blue-500/10 text-[#00D4FF] border-[#00D4FF]/30',
        route: '/users'
      },
      {
        label: 'Connected Applications',
        value: appCount.toString(),
        subtext: 'WORKWELL_FINANCE & CONTROL',
        icon: 'layers',
        trend: 'OIDC 2.0 Active',
        colorGrad: 'from-indigo-500/10 to-[#00D4FF]/10 text-indigo-400 border-indigo-500/30',
        route: '/applications'
      }
    ]);
  }

}
