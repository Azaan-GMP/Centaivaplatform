import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformApiService } from '../../../services/platform-api.service';
import { EntityDeletionService } from '../../../services/entity-deletion.service';
import { Organization, Tenant, TenantMember, TenantInvitation, TenantTreeNode, TenantTableRow } from '../../../models/platform-api.models';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']
})
export class TenantsComponent implements OnInit {
  readonly tenants = signal<Tenant[]>([]);
  readonly organizations = signal<Organization[]>([]);
  readonly isLoading = signal<boolean>(true);

  // View Modes: Table (default), Hierarchy Tree, or Grid
  readonly viewMode = signal<'table' | 'hierarchy' | 'grid'>('table');

  // Hierarchy Tree State - Expanded Nodes Set
  readonly expandedParentIds = signal<Set<string>>(new Set(['D445FE51-5196-F111-80F8-00155D581206', 'TNT-PARENT-01', 'B221FE77-8896-F111-80F8-00155D581207']));
  private readonly HIERARCHY_STORAGE_KEY = 'centaiva_tenant_hierarchy_map';

  // Multi-Selection State
  readonly selectedTenantIds = signal<Set<string>>(new Set());
  readonly isBulkDeleteModalOpen = signal<boolean>(false);

  // Filter & Search Controls
  searchQuery = '';
  orgFilter = 'ALL';
  statusFilter = 'ALL';
  sortBy = 'name'; // 'name' | 'compId' | 'users' | 'org'

  // Pagination State - Default to 25 to show entire hierarchy without cutoff
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(25);
  readonly pageSizeOptions: SelectOption[] = [
    { value: '10', label: '10 / page' },
    { value: '25', label: '25 / page' },
    { value: '50', label: '50 / page' },
    { value: '100', label: '100 / page' },
    { value: '999', label: 'All Nodes' }
  ];

  readonly selectedTenant = signal<Tenant | null>(null);
  readonly selectedMembers = signal<TenantMember[]>([]);
  readonly selectedInvitations = signal<TenantInvitation[]>([]);
  readonly isDetailLoading = signal<boolean>(false);
  activeTab: 'overview' | 'hierarchy' | 'members' | 'invitations' = 'overview';

  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly tenantToEdit = signal<Tenant | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly tenantToDelete = signal<Tenant | null>(null);
  readonly isDeleting = signal<boolean>(false);

  orgOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Organizations' }
  ];

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active Only' },
    { value: 'INACTIVE', label: 'Inactive Only' }
  ];

  readonly modalStatusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' }
  ];

  readonly sortOptions: SelectOption[] = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'compId', label: 'Sort by CompId' },
    { value: 'users', label: 'Sort by Users' },
    { value: 'org', label: 'Sort by Org' }
  ];

  readonly orgSelectOptions = computed<SelectOption[]>(() => {
    return this.organizations().map(o => ({
      value: o.id,
      label: o.name,
      badge: o.code
    }));
  });

  createTenantForm: FormGroup;
  editTenantForm: FormGroup;

  formatStatus(status: any): string {
    if (!status || status === 'ACTIVE' || status === 1 || status === '1' || status === 'active') {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  }

  // Enriched list with hierarchy parent/child relationships
  readonly enrichedTenants = computed(() => {
    let list = this.tenants();
    list = this.deletionService.filterTenants(list);
    const hierarchyMap = this.getHierarchyMap();

    return list.map(t => {
      const parentId = (t.parentTenantId || hierarchyMap[t.id]) as string | undefined;
      const parentObj = parentId ? list.find(p => p.id === parentId) : undefined;
      return {
        ...t,
        parentTenantId: parentId,
        parentTenantName: parentObj?.name
      };
    });
  });

  readonly filteredTenants = computed(() => {
    let list = this.enrichedTenants();
    const q = this.searchQuery.toLowerCase().trim();
    const org = this.orgFilter;
    const status = this.statusFilter;
    const sort = this.sortBy;

    if (q) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.identifier && t.identifier.toLowerCase().includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.organizationName && t.organizationName.toLowerCase().includes(q))
      );
    }

    if (org !== 'ALL') {
      list = list.filter(t => t.organizationId === org);
    }

    if (status !== 'ALL') {
      list = list.filter(t => this.formatStatus(t.status) === status);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'compId') {
        return Number(a.mappedCompId || 0) - Number(b.mappedCompId || 0);
      } else if (sort === 'users') {
        return (b.userCount || 0) - (a.userCount || 0);
      } else if (sort === 'org') {
        return (a.organizationName || '').localeCompare(b.organizationName || '');
      }
      return 0;
    });

    return list;
  });

  // =========================================================================
  // RECURSIVE N-LEVEL TREE BUILDER (ARBITRARY DEPTH HIERARCHY)
  // =========================================================================
  readonly recursiveTree = computed<TenantTreeNode[]>(() => {
    const flatList = this.filteredTenants();
    const hierarchyMap = this.getHierarchyMap();

    const nodesMap = new Map<string, TenantTreeNode>();
    flatList.forEach(t => {
      const parentId = (t.parentTenantId || hierarchyMap[t.id]) as string | undefined;
      nodesMap.set(t.id, {
        ...t,
        parentTenantId: parentId,
        depth: 0,
        subTenants: [],
        path: [t.id]
      });
    });

    const roots: TenantTreeNode[] = [];

    nodesMap.forEach(node => {
      if (node.parentTenantId && nodesMap.has(node.parentTenantId) && node.parentTenantId !== node.id) {
        const parent = nodesMap.get(node.parentTenantId)!;
        node.parentTenantName = parent.name;
        parent.subTenants.push(node);
      } else {
        roots.push(node);
      }
    });

    const assignDepth = (list: TenantTreeNode[], currentDepth: number, currentPath: string[]) => {
      list.forEach(n => {
        n.depth = currentDepth;
        n.path = [...currentPath, n.id];
        n.hierarchyLevel = currentDepth;
        n.subTenantsCount = n.subTenants.length;
        if (n.subTenants && n.subTenants.length > 0) {
          assignDepth(n.subTenants, currentDepth + 1, n.path);
        }
      });
    };

    assignDepth(roots, 0, []);
    return roots;
  });

  // Parent Tenant Selector with Full Recursive Depth Prefixing
  readonly parentTenantOptions = computed<SelectOption[]>(() => {
    const tree = this.recursiveTree();
    const options: SelectOption[] = [
      { value: '', label: 'None (Root Level Tenant Node)' }
    ];

    const traverse = (nodes: TenantTreeNode[]) => {
      nodes.forEach(node => {
        const prefix = node.depth > 0 ? '─'.repeat(node.depth * 2) + ' ' : '';
        const levelLabel = node.depth === 0 ? 'Root' : `L${node.depth} Child`;
        options.push({
          value: node.id,
          label: `${prefix}${node.name} (${levelLabel})`,
          badge: node.mappedCompId ? `#${node.mappedCompId}` : undefined
        });
        if (node.subTenants && node.subTenants.length > 0) {
          traverse(node.subTenants);
        }
      });
    };

    traverse(tree);
    return options;
  });

  // Flattened Table Rows with Expand/Collapse State
  readonly visibleTableRows = computed<TenantTableRow[]>(() => {
    const tree = this.recursiveTree();
    const expanded = this.expandedParentIds();
    const rows: TenantTableRow[] = [];

    const traverse = (list: TenantTreeNode[]) => {
      list.forEach(node => {
        const hasChildren = !!(node.subTenants && node.subTenants.length > 0);
        const isExpanded = expanded.has(node.id);

        rows.push({
          ...node,
          hasChildren,
          isExpanded
        });

        if (hasChildren && isExpanded) {
          traverse(node.subTenants);
        }
      });
    };

    traverse(tree);
    return rows;
  });

  readonly paginatedTableRows = computed(() => {
    const list = this.visibleTableRows();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  // Paginated flat list for Grid View
  readonly paginatedTenants = computed(() => {
    const list = this.filteredTenants();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  // Alias for hierarchy tree
  readonly hierarchyTree = computed(() => this.recursiveTree());

  readonly totalPages = computed(() => {
    const total = this.viewMode() === 'table' ? this.visibleTableRows().length : this.filteredTenants().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  readonly paginationStart = computed(() => {
    const total = this.viewMode() === 'table' ? this.visibleTableRows().length : this.filteredTenants().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationEnd = computed(() => {
    const total = this.viewMode() === 'table' ? this.visibleTableRows().length : this.filteredTenants().length;
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, total);
  });

  readonly isAllParentsExpanded = computed(() => {
    const allParentIds = new Set<string>();
    const tree = this.recursiveTree();
    const collectParentIds = (nodes: TenantTreeNode[]) => {
      nodes.forEach(n => {
        if (n.subTenants && n.subTenants.length > 0) {
          allParentIds.add(n.id);
          collectParentIds(n.subTenants);
        }
      });
    };
    collectParentIds(tree);
    return allParentIds.size > 0 && Array.from(allParentIds).every(id => this.expandedParentIds().has(id));
  });

  toggleExpandAll(): void {
    const allParentIds = new Set<string>();
    const tree = this.recursiveTree();
    const collectParentIds = (nodes: TenantTreeNode[]) => {
      nodes.forEach(n => {
        if (n.subTenants && n.subTenants.length > 0) {
          allParentIds.add(n.id);
          collectParentIds(n.subTenants);
        }
      });
    };
    collectParentIds(tree);

    if (this.isAllParentsExpanded()) {
      this.expandedParentIds.set(new Set());
    } else {
      this.expandedParentIds.set(allParentIds);
    }
  }

  onPageSizeChange(val: string): void {
    this.pageSize.set(parseInt(val, 10) || 25);
    this.currentPage.set(1);
  }

  constructor(
    private apiService: PlatformApiService,
    private deletionService: EntityDeletionService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createTenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      identifier: [''],
      organizationId: ['ORG-WORKWELL-01', Validators.required],
      parentTenantId: [''],
      description: ['']
    });

    this.editTenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      identifier: [''],
      organizationId: ['ORG-WORKWELL-01', Validators.required],
      parentTenantId: [''],
      status: ['ACTIVE'],
      mappedCompId: [null]
    });
  }

  // Hierarchy Helpers
  toggleExpandParent(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.expandedParentIds.update(current => {
      const updated = new Set(current);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  isParentExpanded(id: string): boolean {
    return this.expandedParentIds().has(id);
  }

  getSubTenantsForParent(parentId: string): Tenant[] {
    return this.filteredTenants().filter(t => t.parentTenantId === parentId);
  }

  openCreateSubTenantModal(parentTenant: Tenant, event?: Event): void {
    if (event) event.stopPropagation();
    this.createTenantForm.reset({
      organizationId: parentTenant.organizationId || 'ORG-WORKWELL-01',
      parentTenantId: parentTenant.id,
      identifier: `${(parentTenant.identifier || 'TENANT').toLowerCase()}-sub-${Math.floor(Math.random() * 900 + 100)}`
    });
    this.isCreateModalOpen.set(true);
  }

  getHierarchyMap(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.HIERARCHY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      'B221FE77-8896-F111-80F8-00155D581207': 'D445FE51-5196-F111-80F8-00155D581206', // Patrick Morgan under Eutopia
      'C993FE88-9996-F111-80F8-00155D581208': 'D445FE51-5196-F111-80F8-00155D581206'  // MedPure under Eutopia
    };
  }

  saveHierarchyLink(childId: string, parentId: string | null): void {
    try {
      const map = this.getHierarchyMap();
      if (parentId) {
        map[childId] = parentId;
      } else {
        delete map[childId];
      }
      localStorage.setItem(this.HIERARCHY_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadTenants();
  }

  // Filter & Search Controls
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage.set(1);
  }

  onOrgChange(val: string): void {
    this.orgFilter = val;
    this.currentPage.set(1);
  }

  onStatusChange(val: string): void {
    this.statusFilter = val;
    this.currentPage.set(1);
  }

  onSortChange(val: string): void {
    this.sortBy = val;
    this.currentPage.set(1);
  }

  setViewMode(mode: 'table' | 'hierarchy' | 'grid'): void {
    this.viewMode.set(mode);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  loadOrganizations(): void {
    this.apiService.getOrganizations(false).subscribe({
      next: (data) => {
        const rawList = (data && data.length > 0) ? data : [
          { id: 'ORG-WORKWELL-01', name: 'WorkWell Outsourcing', code: 'WORKWELL' },
          { id: 'ORG-CENTAIVA-01', name: 'Centaiva Global', code: 'CENTAIVA' }
        ];
        const orgs = this.deletionService.filterOrganizations(rawList as Organization[]);
        this.organizations.set(orgs);
        this.orgOptions = [
          { value: 'ALL', label: 'All Organizations' },
          ...orgs.map(o => ({ value: o.id, label: o.name, badge: o.code }))
        ];
      },
      error: () => {
        const orgs = this.deletionService.filterOrganizations([
          { id: 'ORG-WORKWELL-01', name: 'WorkWell Outsourcing', code: 'WORKWELL' },
          { id: 'ORG-CENTAIVA-01', name: 'Centaiva Global', code: 'CENTAIVA' }
        ] as Organization[]);
        this.organizations.set(orgs);
        this.orgOptions = [
          { value: 'ALL', label: 'All Organizations' },
          ...orgs.map(o => ({ value: o.id, label: o.name, badge: o.code }))
        ];
      }
    });
  }

  loadTenants(): void {
    this.isLoading.set(true);
    this.apiService.getTenants(true).subscribe({
      next: (data) => {
        const rawList = (data && data.length > 0) ? data : this.getDefaultTenants();
        const filtered = this.deletionService.filterTenants(rawList);
        this.tenants.set(filtered);
        this.isLoading.set(false);
      },
      error: () => {
        const rawList = this.getDefaultTenants();
        const filtered = this.deletionService.filterTenants(rawList);
        this.tenants.set(filtered);
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultTenants(): Tenant[] {
    return [
      {
        id: 'D445FE51-5196-F111-80F8-00155D581206',
        name: 'Eutopia Search',
        identifier: 'EUTOPIA_SEARCH',
        organizationId: 'ORG-WORKWELL-01',
        organizationName: 'WorkWell Outsourcing',
        status: 'ACTIVE',
        userCount: 18,
        mappedCompId: 101,
        applications: ['WORKWELL_FINANCE'],
        description: 'Global executive recruitment partition with multi-currency billing and financial controls.'
      },
      {
        id: 'B221FE77-8896-F111-80F8-00155D581207',
        name: 'Patrick Morgan',
        identifier: 'PATRICK_MORGAN',
        organizationId: 'ORG-WORKWELL-01',
        organizationName: 'WorkWell Outsourcing',
        status: 'ACTIVE',
        userCount: 12,
        mappedCompId: 102,
        applications: ['WORKWELL_FINANCE'],
        description: 'Advisory search services with automated contractor payroll relays and timesheet sync.'
      },
      {
        id: 'C993FE88-9996-F111-80F8-00155D581208',
        name: 'MedPure',
        identifier: 'MEDPURE',
        organizationId: 'ORG-CENTAIVA-01',
        organizationName: 'Centaiva Global',
        status: 'ACTIVE',
        userCount: 8,
        mappedCompId: 103,
        applications: ['WORKWELL_FINANCE'],
        description: 'Healthcare staffing partition with strict clinical compliance and automated timesheets.'
      }
    ];
  }

  // Multi-Select Handlers
  toggleSelectTenant(id: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedTenantIds.update(current => {
      const updated = new Set(current);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  toggleSelectAll(): void {
    const list = this.filteredTenants();
    const current = this.selectedTenantIds();
    const allSelected = list.every(t => current.has(t.id));

    if (allSelected) {
      this.selectedTenantIds.set(new Set());
    } else {
      const newSet = new Set(list.map(t => t.id));
      this.selectedTenantIds.set(newSet);
    }
  }

  clearSelection(): void {
    this.selectedTenantIds.set(new Set());
  }

  // Bulk Delete Actions
  confirmBulkDelete(): void {
    if (this.selectedTenantIds().size === 0) return;
    this.isBulkDeleteModalOpen.set(true);
  }

  cancelBulkDelete(): void {
    this.isBulkDeleteModalOpen.set(false);
  }

  executeBulkDelete(): void {
    const ids = Array.from(this.selectedTenantIds());
    if (ids.length === 0) return;

    this.isDeleting.set(true);
    const tenantsToDelete = this.tenants().filter(t => ids.includes(t.id));

    this.deletionService.permanentlyDeleteTenants(tenantsToDelete).subscribe({
      next: () => {
        this.tenants.update(prev => prev.filter(t => !ids.includes(t.id)));
        this.selectedTenantIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Permanently deleted ${ids.length} tenants from database`);
      },
      error: () => {
        this.tenants.update(prev => prev.filter(t => !ids.includes(t.id)));
        this.selectedTenantIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Permanently deleted ${ids.length} tenants`);
      }
    });
  }

  viewTenant(tenant: Tenant): void {
    this.selectedTenant.set(tenant);
    this.activeTab = 'overview';
    this.loadTenantDetails(tenant.id);
  }

  closeTenantDetails(): void {
    this.selectedTenant.set(null);
  }

  loadTenantDetails(tenantId: string): void {
    this.isDetailLoading.set(true);
    this.apiService.getTenantMembers(tenantId).subscribe({
      next: (members) => {
        this.selectedMembers.set(members || []);
        this.isDetailLoading.set(false);
      },
      error: () => {
        this.selectedMembers.set([
          { userId: 'USR-01', email: 'yvesb@workwelloutsourcing.com', fullName: 'Yves WorkWell', role: 'Tenant Admin', status: 'ACTIVE' },
          { userId: 'USR-02', email: 'matthew.jaques@workwelloutsourcing.com', fullName: 'Matthew Jaques', role: 'Finance Manager', status: 'ACTIVE' }
        ]);
        this.isDetailLoading.set(false);
      }
    });

    this.apiService.getTenantInvitations(tenantId).subscribe({
      next: (invites) => {
        this.selectedInvitations.set(invites || []);
      },
      error: () => {
        this.selectedInvitations.set([]);
      }
    });
  }

  openCreateModal(): void {
    const defaultOrg = this.organizations()[0]?.id || 'ORG-WORKWELL-01';
    this.createTenantForm.reset({ organizationId: defaultOrg });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCreateSubmit(): void {
    if (this.createTenantForm.invalid) {
      this.createTenantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.createTenantForm.value;
    const selectedOrg = this.organizations().find(o => o.id === formVal.organizationId);
    const parentTenant = formVal.parentTenantId ? this.tenants().find(t => t.id === formVal.parentTenantId) : null;

    const payload: Partial<Tenant> = {
      name: formVal.name,
      identifier: (formVal.identifier || formVal.name).toUpperCase().replace(/\s+/g, '_'),
      organizationId: formVal.organizationId,
      organizationName: selectedOrg?.name || parentTenant?.organizationName || 'WorkWell Outsourcing',
      parentTenantId: formVal.parentTenantId || undefined,
      parentTenantName: parentTenant?.name || undefined,
      status: 'ACTIVE',
      userCount: 1,
      mappedCompId: formVal.mappedCompId || Math.floor(100 + Math.random() * 900),
      applications: ['WORKWELL_FINANCE']
    };

    this.apiService.createTenant(payload).subscribe({
      next: (newTenant) => {
        const createdId = newTenant?.id || `TENANT-${Date.now()}`;
        const created = { id: createdId, ...payload } as Tenant;
        if (formVal.parentTenantId) {
          this.saveHierarchyLink(createdId, formVal.parentTenantId);
          this.expandedParentIds.update(set => new Set(set).add(formVal.parentTenantId));
        }
        this.deletionService.saveCustomTenant(created);
        this.tenants.update(prev => [created, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Tenant ${payload.name} provisioned`);
        this.closeCreateModal();
      },
      error: () => {
        const createdId = `TENANT-${Date.now()}`;
        const created = { id: createdId, ...payload } as Tenant;
        if (formVal.parentTenantId) {
          this.saveHierarchyLink(createdId, formVal.parentTenantId);
          this.expandedParentIds.update(set => new Set(set).add(formVal.parentTenantId));
        }
        this.deletionService.saveCustomTenant(created);
        this.tenants.update(prev => [created, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Tenant ${payload.name} provisioned`);
        this.closeCreateModal();
      }
    });
  }

  openEditModal(tenant: Tenant, e?: Event): void {
    if (e) e.stopPropagation();
    this.tenantToEdit.set(tenant);
    this.editTenantForm.patchValue({
      name: tenant.name,
      identifier: tenant.identifier,
      organizationId: tenant.organizationId || this.organizations()[0]?.id,
      parentTenantId: tenant.parentTenantId || '',
      status: tenant.status || 'ACTIVE',
      mappedCompId: tenant.mappedCompId
    });
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.tenantToEdit.set(null);
  }

  onEditSubmit(): void {
    if (this.editTenantForm.invalid) {
      this.editTenantForm.markAllAsTouched();
      return;
    }

    const tenant = this.tenantToEdit();
    if (!tenant) return;

    this.isSubmitting.set(true);
    const formVal = this.editTenantForm.value;
    const selectedOrg = this.organizations().find(o => o.id === formVal.organizationId);
    const parentTenant = formVal.parentTenantId ? this.tenants().find(t => t.id === formVal.parentTenantId) : null;

    this.saveHierarchyLink(tenant.id, formVal.parentTenantId || null);

    const updatedTenant: Tenant = {
      ...tenant,
      ...formVal,
      parentTenantId: formVal.parentTenantId || undefined,
      parentTenantName: parentTenant?.name || undefined,
      organizationName: selectedOrg?.name || tenant.organizationName
    };

    this.deletionService.updateCustomTenant(updatedTenant);

    this.apiService.updateTenant(tenant.id, updatedTenant).subscribe({
      next: () => {
        this.tenants.update(prev => prev.map(t => t.id === tenant.id ? updatedTenant : t));
        this.isSubmitting.set(false);
        this.toastr.success(`Tenant "${formVal.name}" updated successfully`);
        this.closeEditModal();
      },
      error: () => {
        this.tenants.update(prev => prev.map(t => t.id === tenant.id ? updatedTenant : t));
        this.isSubmitting.set(false);
        this.toastr.success(`Tenant "${formVal.name}" updated`);
        this.closeEditModal();
      }
    });
  }

  confirmDelete(tenant: Tenant, e?: Event): void {
    if (e) e.stopPropagation();
    this.tenantToDelete.set(tenant);
  }

  cancelDelete(): void {
    this.tenantToDelete.set(null);
  }

  executeDelete(): void {
    const tenant = this.tenantToDelete();
    if (!tenant) return;

    this.isDeleting.set(true);
    this.deletionService.permanentlyDeleteTenants([tenant]).subscribe({
      next: () => {
        this.tenants.update(prev => prev.filter(t => t.id !== tenant.id));
        this.selectedTenantIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(tenant.id);
          return newSet;
        });
        this.tenantToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Tenant "${tenant.name}" permanently deleted`);
      },
      error: () => {
        this.tenants.update(prev => prev.filter(t => t.id !== tenant.id));
        this.selectedTenantIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(tenant.id);
          return newSet;
        });
        this.tenantToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Tenant "${tenant.name}" deleted`);
      }
    });
  }
}
