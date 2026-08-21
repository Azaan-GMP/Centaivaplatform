import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Application, Role, RoleScope, SelectOption } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { ApplicationsService, RolesService } from '../../core/services/data-contracts';
import {
  EmptyStateComponent,
  EntityAvatarComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SearchInputComponent,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';

interface MatrixGroup {
  module: string;
  rows: { feature: string; permissionKey: string; permissionName: string; granted: boolean }[];
}

@Component({
  selector: 'ctv-roles-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    SelectModule,
    CheckboxModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    SearchInputComponent,
    EntityAvatarComponent,
    TabNavComponent,
    EmptyStateComponent,
    RelativeTimePipe,
  ],
  templateUrl: './roles.page.html',
  styleUrl: './roles.page.scss',
})
export class RolesPage {
  private readonly roles = inject(RolesService);
  private readonly applications = inject(ApplicationsService);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);

  readonly rows = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly selectedId = signal<string | null>(null);
  readonly activeTab = signal('permissions');
  readonly matrixSearch = signal('');
  readonly onlyGranted = signal(false);

  readonly createOpen = signal(false);
  readonly assignOpen = signal(false);
  readonly dirty = signal(false);

  private readonly applicationList = signal<Application[]>([]);
  private readonly draftGrants = signal<Set<string>>(new Set<string>());

  readonly scopeOptions: SelectOption<RoleScope>[] = [
    { label: 'Platform', value: 'Platform' },
    { label: 'Organization', value: 'Organization' },
    { label: 'Tenant', value: 'Tenant' },
    { label: 'Application', value: 'Application' },
  ];

  readonly applicationOptions = computed<SelectOption[]>(() =>
    this.applicationList().map((application) => ({ label: application.name, value: application.key })),
  );

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    key: ['', Validators.required],
    scope: ['Tenant' as RoleScope, Validators.required],
    applicationKey: [''],
    description: [''],
  });

  readonly assignForm = this.formBuilder.nonNullable.group({
    principal: ['', Validators.required],
    scopeName: ['', Validators.required],
  });

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.rows();
    return this.rows().filter((role) =>
      `${role.name} ${role.key} ${role.description} ${role.scope} ${role.applicationName}`.toLowerCase().includes(term),
    );
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? (this.rows().find((role) => role.id === id) ?? null) : null;
  });

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'permissions', label: 'Permissions', count: this.grantedCount() },
    { key: 'assignments', label: 'Assignments', count: this.selected()?.assignments.length ?? 0 },
    { key: 'details', label: 'Details' },
  ]);

  /** Permission matrix grouped by module, honouring the local draft state. */
  readonly matrix = computed<MatrixGroup[]>(() => {
    const role = this.selected();
    if (!role) return [];

    const term = this.matrixSearch().toLowerCase().trim();
    const granted = this.draftGrants();
    const groups = new Map<string, MatrixGroup>();

    for (const grant of role.permissions) {
      const isGranted = granted.has(grant.permissionKey);
      if (this.onlyGranted() && !isGranted) continue;
      if (term && !`${grant.permissionKey} ${grant.permissionName} ${grant.module} ${grant.feature}`.toLowerCase().includes(term)) {
        continue;
      }

      const group = groups.get(grant.module) ?? { module: grant.module, rows: [] };
      group.rows.push({
        feature: grant.feature,
        permissionKey: grant.permissionKey,
        permissionName: grant.permissionName,
        granted: isGranted,
      });
      groups.set(grant.module, group);
    }

    return [...groups.values()];
  });

  readonly grantedCount = computed(() => this.draftGrants().size);

  readonly totalPermissions = computed(() => this.selected()?.permissions.length ?? 0);

  readonly scopeCounts = computed(() => {
    const all = this.rows();
    return {
      platform: all.filter((role) => role.scope === 'Platform').length,
      organization: all.filter((role) => role.scope === 'Organization').length,
      tenant: all.filter((role) => role.scope === 'Tenant').length,
      application: all.filter((role) => role.scope === 'Application').length,
    };
  });

  constructor() {
    this.roles.all().subscribe((roles) => {
      this.rows.set(roles);
      this.loading.set(false);
      if (!this.selectedId() && roles[0]) {
        this.selectRole(roles[0]);
      }
    });

    this.applications.all().subscribe((applications) => this.applicationList.set(applications));
  }

  selectRole(role: Role): void {
    this.selectedId.set(role.id);
    this.draftGrants.set(new Set(role.permissions.filter((grant) => grant.granted).map((grant) => grant.permissionKey)));
    this.dirty.set(false);
    this.activeTab.set('permissions');
  }

  togglePermission(permissionKey: string): void {
    this.draftGrants.update((current) => {
      const next = new Set(current);
      if (next.has(permissionKey)) {
        next.delete(permissionKey);
      } else {
        next.add(permissionKey);
      }
      return next;
    });
    this.dirty.set(true);
  }

  toggleModule(group: MatrixGroup): void {
    const allGranted = group.rows.every((row) => this.draftGrants().has(row.permissionKey));
    this.draftGrants.update((current) => {
      const next = new Set(current);
      for (const row of group.rows) {
        if (allGranted) {
          next.delete(row.permissionKey);
        } else {
          next.add(row.permissionKey);
        }
      }
      return next;
    });
    this.dirty.set(true);
  }

  moduleAllGranted(group: MatrixGroup): boolean {
    return group.rows.length > 0 && group.rows.every((row) => this.draftGrants().has(row.permissionKey));
  }

  savePermissions(): void {
    const role = this.selected();
    if (!role) return;

    this.roles.updatePermissions(role.id, [...this.draftGrants()]).subscribe((updated) => {
      if (updated) {
        this.rows.update((roles) => roles.map((candidate) => (candidate.id === updated.id ? updated : candidate)));
      }
      this.dirty.set(false);
      this.notifications.success('Permissions saved', `${role.name} now grants ${this.draftGrants().size} permissions.`);
    });
  }

  resetPermissions(): void {
    const role = this.selected();
    if (!role) return;
    this.draftGrants.set(new Set(role.permissions.filter((grant) => grant.granted).map((grant) => grant.permissionKey)));
    this.dirty.set(false);
  }

  openCreate(): void {
    this.createForm.reset({ scope: 'Tenant' });
    this.createOpen.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    const application = this.applicationList().find((candidate) => candidate.key === value.applicationKey);

    this.roles
      .create({
        name: value.name,
        key: value.key,
        scope: value.scope,
        applicationKey: value.applicationKey || null,
        applicationName: application?.name ?? 'All applications',
        description: value.description,
      })
      .subscribe((role) => {
        this.rows.update((roles) => [...roles, role]);
        this.createOpen.set(false);
        this.selectRole(role);
        this.notifications.success('Role created', `${role.name} was created as a draft.`);
      });
  }

  openAssign(): void {
    this.assignForm.reset();
    this.assignOpen.set(true);
  }

  submitAssign(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    const value = this.assignForm.getRawValue();
    this.assignOpen.set(false);
    this.notifications.success('Role assigned', `${value.principal} was granted ${this.selected()?.name} on ${value.scopeName}.`);
  }
}
