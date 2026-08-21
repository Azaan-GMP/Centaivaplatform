import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import {
  Organization,
  OrganizationNode,
  OrganizationType,
  SelectOption,
  Tenant,
} from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import {
  AuditService,
  LicensesService,
  OrganizationsService,
  TenantsService,
} from '../../core/services/data-contracts';
import { AuditEvent, LicensePool } from '../../core/models';
import {
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  EntityAvatarComponent,
  MetricProgressComponent,
  PageHeaderComponent,
  RelativeTimePipe,
  SearchInputComponent,
  SectionCardComponent,
  StatusBadgeComponent,
  TabItem,
  TabNavComponent,
} from '../../shared';
import { OrgTreeNodeComponent, TreeNodeEvent } from './org-tree-node.component';

@Component({
  selector: 'ctv-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    TooltipModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    EntityAvatarComponent,
    DefinitionListComponent,
    MetricProgressComponent,
    SearchInputComponent,
    TabNavComponent,
    EmptyStateComponent,
    OrgTreeNodeComponent,
    RelativeTimePipe,
  ],
  templateUrl: './organizations.page.html',
  styleUrl: './organizations.page.scss',
})
export class OrganizationsPage {
  private readonly organizations = inject(OrganizationsService);
  private readonly tenants = inject(TenantsService);
  private readonly licenses = inject(LicensesService);
  private readonly audit = inject(AuditService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly id = input<string>('');

  readonly tree = signal<OrganizationNode[]>([]);
  readonly flat = signal<Organization[]>([]);
  readonly loading = signal(true);
  readonly selectedId = signal<string | null>(null);
  readonly expandedIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly search = signal('');
  readonly activeTab = signal('overview');

  readonly allTenants = signal<Tenant[]>([]);
  readonly pools = signal<LicensePool[]>([]);
  readonly auditEvents = signal<AuditEvent[]>([]);

  readonly addChildOpen = signal(false);
  readonly moveOpen = signal(false);
  readonly editOpen = signal(false);
  readonly inviteOpen = signal(false);

  readonly typeOptions: SelectOption<OrganizationType>[] = [
    { label: 'Customer', value: 'Customer' },
    { label: 'Partner', value: 'Partner' },
    { label: 'Reseller', value: 'Reseller' },
    { label: 'Division', value: 'Division' },
    { label: 'Region', value: 'Region' },
    { label: 'Vendor', value: 'Vendor' },
  ];

  readonly regionOptions: SelectOption[] = [
    { label: 'UK South', value: 'UK South' },
    { label: 'UK West', value: 'UK West' },
    { label: 'EU West', value: 'EU West' },
    { label: 'US East', value: 'US East' },
  ];

  readonly childForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    key: ['', Validators.required],
    slug: [''],
    type: ['Customer' as OrganizationType, Validators.required],
    region: ['UK South', Validators.required],
    ownerName: [''],
    ownerEmail: ['', Validators.email],
  });

  readonly moveForm = this.formBuilder.nonNullable.group({
    parentId: ['', Validators.required],
  });

  readonly editForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    type: ['Customer' as OrganizationType, Validators.required],
    region: ['UK South', Validators.required],
    ownerName: [''],
    ownerEmail: [''],
    description: [''],
  });

  readonly inviteForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['Organization Admin', Validators.required],
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? (this.flat().find((organization) => organization.id === id) ?? null) : null;
  });

  readonly parent = computed(() => {
    const organization = this.selected();
    if (!organization?.parentId) return null;
    return this.flat().find((candidate) => candidate.id === organization.parentId) ?? null;
  });

  readonly ancestry = computed(() => {
    const organization = this.selected();
    if (!organization) return [];
    return organization.path
      .map((id) => this.flat().find((candidate) => candidate.id === id))
      .filter((candidate): candidate is Organization => !!candidate);
  });

  readonly children = computed(() => {
    const organization = this.selected();
    if (!organization) return [];
    return this.flat().filter((candidate) => candidate.parentId === organization.id);
  });

  /** Every organization beneath the selection, at any depth. */
  readonly descendants = computed(() => {
    const organization = this.selected();
    if (!organization) return [];
    return this.flat().filter(
      (candidate) => candidate.id !== organization.id && candidate.path.includes(organization.id),
    );
  });

  readonly organizationTenants = computed(() => {
    const organization = this.selected();
    if (!organization) return [];
    const ids = new Set([organization.id, ...this.descendants().map((candidate) => candidate.id)]);
    return this.allTenants().filter((tenant) => ids.has(tenant.organizationId));
  });

  readonly organizationPools = computed(() => {
    const organization = this.selected();
    if (!organization) return [];
    return this.pools().filter((pool) => pool.ownerName === organization.name);
  });

  readonly moveTargets = computed<SelectOption[]>(() => {
    const organization = this.selected();
    if (!organization) return [];
    return this.flat()
      .filter((candidate) => candidate.id !== organization.id && !candidate.path.includes(organization.id))
      .map((candidate) => ({ label: this.pathLabel(candidate), value: candidate.id }));
  });

  readonly parentOptions = computed<SelectOption[]>(() =>
    this.flat().map((candidate) => ({ label: this.pathLabel(candidate), value: candidate.id })),
  );

  readonly overviewItems = computed<DefinitionItem[]>(() => {
    const organization = this.selected();
    if (!organization) return [];
    return [
      { label: 'Organization Name', value: organization.name },
      { label: 'Key', value: organization.key, mono: true },
      { label: 'Slug', value: organization.slug, mono: true },
      { label: 'Type', value: organization.type },
      { label: 'Parent', value: this.parent()?.name ?? 'None — hierarchy root' },
      { label: 'Region', value: organization.region },
      { label: 'Timezone', value: organization.timeZone },
      { label: 'Status', value: organization.status },
      {
        label: 'Created',
        value: new Date(organization.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
      { label: 'Depth', value: `Level ${organization.path.length}` },
    ];
  });

  readonly tabs = computed<TabItem[]>(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'children', label: 'Children', count: this.children().length },
    { key: 'tenants', label: 'Tenants', count: this.organizationTenants().length },
    { key: 'members', label: 'Members', count: this.selected()?.members.length ?? 0 },
    { key: 'roles', label: 'Roles' },
    { key: 'licensing', label: 'Licensing' },
    { key: 'commercial', label: 'Commercial' },
    { key: 'audit', label: 'Audit' },
  ]);

  readonly hierarchyStats = computed(() => {
    const all = this.flat();
    return {
      total: all.length,
      maxDepth: all.reduce((depth, organization) => Math.max(depth, organization.path.length), 0),
      customers: all.filter((organization) => organization.type === 'Customer').length,
      partners: all.filter((organization) => organization.type === 'Partner' || organization.type === 'Reseller').length,
    };
  });

  constructor() {
    this.organizations.all().subscribe((organizations) => {
      this.flat.set(organizations);
      if (!this.selectedId()) {
        const initial = this.id() || organizations.find((organization) => organization.key === 'CUST-ALPHA')?.id || organizations[0]?.id;
        this.selectedId.set(initial ?? null);
      }
      // Expand the ancestry of the initial selection so it is visible immediately.
      const current = organizations.find((organization) => organization.id === this.selectedId());
      if (current) {
        this.expandedIds.set(new Set(current.path));
      }
    });

    this.organizations.tree().subscribe((tree) => {
      this.tree.set(tree);
      this.loading.set(false);
    });

    this.tenants.all().subscribe((tenants) => this.allTenants.set(tenants));
    this.licenses.pools().subscribe((pools) => this.pools.set(pools));
    this.audit.list({ pageSize: 10, page: 1 }).subscribe((result) => this.auditEvents.set(result.items));

    effect(() => {
      const routeId = this.id();
      if (routeId && routeId !== this.selectedId()) {
        this.selectedId.set(routeId);
      }
    });
  }

  onSelect(event: TreeNodeEvent): void {
    this.selectedId.set(event.id);
    this.activeTab.set('overview');
    void this.router.navigate(['/app/organizations', event.id], { replaceUrl: true });
  }

  onToggle(event: TreeNodeEvent): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(event.id)) {
        next.delete(event.id);
      } else {
        next.add(event.id);
      }
      return next;
    });
  }

  expandAll(): void {
    this.expandedIds.set(new Set(this.flat().map((organization) => organization.id)));
  }

  collapseAll(): void {
    const roots = this.flat().filter((organization) => organization.parentId === null);
    this.expandedIds.set(new Set(roots.map((organization) => organization.id)));
  }

  pathLabel(organization: Organization): string {
    return organization.path
      .map((id) => this.flat().find((candidate) => candidate.id === id)?.name ?? '')
      .filter(Boolean)
      .join(' / ');
  }

  /* ---------------- Dialogs ---------------- */

  openAddChild(): void {
    this.childForm.reset({ type: 'Customer', region: this.selected()?.region ?? 'UK South' });
    this.addChildOpen.set(true);
  }

  submitAddChild(): void {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    const parent = this.selected();
    const value = this.childForm.getRawValue();

    this.organizations
      .create({
        name: value.name,
        key: value.key,
        slug: value.slug || value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: value.type,
        region: value.region as Organization['region'],
        parentId: parent?.id ?? null,
        ownerName: value.ownerName || 'Unassigned',
        ownerEmail: value.ownerEmail,
        description: `${value.type} organization created from the console.`,
      })
      .subscribe(() => {
        this.refresh();
        this.addChildOpen.set(false);
        this.notifications.success('Organization created', `${value.name} was added beneath ${parent?.name ?? 'the root'}.`);
      });
  }

  openMove(): void {
    this.moveForm.reset({ parentId: this.selected()?.parentId ?? '' });
    this.moveOpen.set(true);
  }

  submitMove(): void {
    const organization = this.selected();
    const target = this.moveForm.getRawValue().parentId;
    if (!organization || !target) {
      this.moveForm.markAllAsTouched();
      return;
    }

    this.organizations.move(organization.id, target).subscribe((moved) => {
      if (!moved) {
        this.notifications.error('Move rejected', 'An organization cannot be moved beneath one of its own descendants.');
        return;
      }
      this.refresh();
      this.moveOpen.set(false);
      this.notifications.success('Organization moved', `${organization.name} now sits beneath a new parent.`);
    });
  }

  openEdit(): void {
    const organization = this.selected();
    if (!organization) return;
    this.editForm.reset({
      name: organization.name,
      type: organization.type,
      region: organization.region,
      ownerName: organization.ownerName,
      ownerEmail: organization.ownerEmail,
      description: organization.description,
    });
    this.editOpen.set(true);
  }

  submitEdit(): void {
    const organization = this.selected();
    if (!organization || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.getRawValue();
    this.organizations
      .update(organization.id, {
        name: value.name,
        type: value.type,
        region: value.region as Organization['region'],
        ownerName: value.ownerName,
        ownerEmail: value.ownerEmail,
        description: value.description,
      })
      .subscribe(() => {
        this.refresh();
        this.editOpen.set(false);
        this.notifications.success('Organization updated', `${value.name} was saved.`);
      });
  }

  openInvite(): void {
    this.inviteForm.reset({ role: 'Organization Admin' });
    this.inviteOpen.set(true);
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const value = this.inviteForm.getRawValue();
    this.inviteOpen.set(false);
    this.notifications.success('Invitation sent', `${value.email} was invited as ${value.role}.`);
  }

  private refresh(): void {
    this.organizations.all().subscribe((organizations) => this.flat.set(organizations));
    this.organizations.tree().subscribe((tree) => this.tree.set(tree));
  }

  openTenant(tenantId: string): void {
    void this.router.navigate(['/app/tenants', tenantId]);
  }
}
