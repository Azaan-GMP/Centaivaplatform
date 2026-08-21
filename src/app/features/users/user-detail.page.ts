import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuditEvent, PlatformUser, Role } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService, RolesService, UsersService } from '../../core/services/data-contracts';
import {
  ConfirmDialogComponent,
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  EntityAvatarComponent,
  LoadingSkeletonComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

@Component({
  selector: 'ctv-user-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    EntityAvatarComponent,
    DefinitionListComponent,
    TabNavComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ConfirmDialogComponent,
    RelativeTimePipe,
  ],
  templateUrl: './user-detail.page.html',
  styleUrl: './user-detail.page.scss',
})
export class UserDetailPage {
  private readonly users = inject(UsersService);
  private readonly roles = inject(RolesService);
  private readonly audit = inject(AuditService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /** Bound from the route parameter via withComponentInputBinding(). */
  readonly id = input<string>('');

  readonly user = signal<PlatformUser | null>(null);
  readonly loading = signal(true);
  readonly activeTab = signal('overview');
  readonly allRoles = signal<Role[]>([]);
  readonly auditEvents = signal<AuditEvent[]>([]);
  readonly confirmDisableOpen = signal(false);

  readonly tabs = computed<TabItem[]>(() => {
    const user = this.user();
    return [
      { key: 'overview', label: 'Overview' },
      { key: 'organizations', label: 'Organizations', count: user?.organizations.length ?? 0 },
      { key: 'tenants', label: 'Tenants', count: user?.tenants.length ?? 0 },
      { key: 'roles', label: 'Roles', count: this.assignedRoles().length },
      { key: 'permissions', label: 'Permissions', count: this.effectivePermissions().length },
      { key: 'products', label: 'Products', count: user?.productKeys.length ?? 0 },
      { key: 'security', label: 'Security' },
      { key: 'sessions', label: 'Sessions', count: user?.sessions.length ?? 0 },
      { key: 'audit', label: 'Audit', count: this.auditEvents().length },
    ];
  });

  readonly overviewItems = computed<DefinitionItem[]>(() => {
    const user = this.user();
    if (!user) return [];
    return [
      { label: 'User ID', value: user.id, mono: true },
      { label: 'Email', value: user.email },
      { label: 'Display Name', value: user.displayName },
      { label: 'Status', value: user.status },
      { label: 'MFA Status', value: user.mfa },
      { label: 'Email Verified', value: user.emailVerified ? 'Yes' : 'No' },
      { label: 'Created', value: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
      {
        label: 'Last Sign In',
        value: user.lastSignInAt
          ? new Date(user.lastSignInAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Never',
      },
      { label: 'Preferred Locale', value: user.locale },
      { label: 'Time Zone', value: user.timeZone },
    ];
  });

  readonly assignedRoles = computed(() => {
    const user = this.user();
    if (!user) return [];
    return this.allRoles().filter((role) => role.name === user.primaryRole || user.roleIds.includes(role.id));
  });

  readonly effectivePermissions = computed(() =>
    this.assignedRoles()
      .flatMap((role) => role.permissions.filter((grant) => grant.granted))
      .filter((grant, index, all) => all.findIndex((other) => other.permissionKey === grant.permissionKey) === index),
  );

  readonly accessSummary = computed(() => {
    const user = this.user();
    return {
      organizations: user?.organizations.length ?? 0,
      tenants: user?.tenants.length ?? 0,
      roles: this.assignedRoles().length,
      permissions: this.effectivePermissions().length,
      products: user?.productKeys.length ?? 0,
    };
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.loading.set(true);
      this.users.byId(id).subscribe((user) => {
        this.user.set(user ?? null);
        this.loading.set(false);
      });
    });

    this.roles.all().subscribe((roles) => this.allRoles.set(roles));
    this.audit.list({ pageSize: 12, page: 1 }).subscribe((result) => this.auditEvents.set(result.items));
  }

  back(): void {
    void this.router.navigate(['/app/users']);
  }

  action(label: string, detail: string): void {
    this.notifications.success(label, detail);
  }

  askDisable(): void {
    this.confirmDisableOpen.set(true);
  }

  disable(): void {
    const user = this.user();
    if (!user) return;

    const nextStatus: PlatformUser['status'] = user.status === 'Disabled' ? 'Active' : 'Disabled';
    this.users.setStatus(user.id, nextStatus).subscribe(() => {
      this.user.set({ ...user, status: nextStatus });
      this.notifications.success(
        nextStatus === 'Disabled' ? 'User disabled' : 'User enabled',
        `${user.displayName} is now ${nextStatus.toLowerCase()}.`,
      );
    });
  }

  revokeSession(sessionId: string): void {
    const user = this.user();
    if (!user) return;
    this.user.set({ ...user, sessions: user.sessions.filter((session) => session.id !== sessionId) });
    this.notifications.success('Session revoked', 'The session was terminated across every Centaiva product.');
  }
}
