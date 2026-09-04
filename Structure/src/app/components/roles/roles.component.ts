import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformApiService } from '../../../services/platform-api.service';
import { Role } from '../../../models/platform-api.models';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal<boolean>(true);

  // View Modes: Table (default) or Grid
  readonly viewMode = signal<'table' | 'grid'>('table');

  // Multi-Selection State
  readonly selectedRoleIds = signal<Set<string>>(new Set());
  readonly isBulkDeleteModalOpen = signal<boolean>(false);

  // Search & Filters
  searchQuery = '';
  appFilter = 'ALL';
  typeFilter = 'ALL';
  sortBy = 'displayName'; // 'displayName' | 'name' | 'app' | 'permissions'

  // Pagination State
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(6);

  // Details Drawer
  readonly selectedRole = signal<Role | null>(null);
  activeTab: 'overview' | 'permissions' | 'users' = 'overview';

  // Modals State
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly roleToEdit = signal<Role | null>(null);
  readonly roleToDelete = signal<Role | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);

  readonly appOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Applications' },
    { value: 'WORKWELL_FINANCE', label: 'WorkWell Finance' },
    { value: 'CENTAIVA_CONTROL_WEB', label: 'Centaiva Control Web' },
    { value: 'GLOBAL', label: 'Global Platform' }
  ];

  readonly typeOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Role Types' },
    { value: 'SYSTEM', label: 'System Protected' },
    { value: 'CUSTOM', label: 'Custom App Roles' }
  ];

  readonly sortOptions: SelectOption[] = [
    { value: 'displayName', label: 'Sort by Display Name' },
    { value: 'name', label: 'Sort by Identifier' },
    { value: 'app', label: 'Sort by Application' },
    { value: 'permissions', label: 'Sort by Permissions Count' }
  ];

  readonly appSelectOptions: SelectOption[] = [
    { value: 'WORKWELL_FINANCE', label: 'WORKWELL_FINANCE' },
    { value: 'CENTAIVA_CONTROL_WEB', label: 'CENTAIVA_CONTROL_WEB' },
    { value: 'GLOBAL', label: 'GLOBAL' }
  ];

  readonly availablePermissionPills: string[] = [
    'ORGANIZATIONS_READ',
    'ORGANIZATIONS_WRITE',
    'TENANTS_READ',
    'TENANTS_WRITE',
    'USERS_READ',
    'USERS_MANAGE',
    'ROLES_MANAGE',
    'FINANCE_ACCESS',
    'FINANCE_TRANSACTIONS',
    'REPORTS_EXPORT',
    'APPLICATIONS_MANAGE',
    'PRODUCTS_MANAGE',
    'AUDIT_VIEW'
  ];

  readonly selectedCreatePermissions = signal<Set<string>>(new Set(['ORGANIZATIONS_READ', 'TENANTS_READ', 'USERS_READ']));
  readonly selectedEditPermissions = signal<Set<string>>(new Set());
  customPermissionInput = '';

  createRoleForm: FormGroup;
  editRoleForm: FormGroup;

  constructor(
    private apiService: PlatformApiService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createRoleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      displayName: ['', Validators.required],
      applicationKey: ['WORKWELL_FINANCE', Validators.required],
      description: ['']
    });

    this.editRoleForm = this.fb.group({
      displayName: ['', Validators.required],
      applicationKey: ['WORKWELL_FINANCE', Validators.required],
      description: ['']
    });
  }
  readonly filteredRoles = computed(() => {
    let list = this.roles();
    const q = this.searchQuery.toLowerCase().trim();
    const app = this.appFilter;
    const type = this.typeFilter;
    const sort = this.sortBy;

    if (q) {
      list = list.filter(r =>
        (r.displayName && r.displayName.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.applicationKey && r.applicationKey.toLowerCase().includes(q))
      );
    }

    if (app !== 'ALL') {
      list = list.filter(r => r.applicationKey === app);
    }

    if (type !== 'ALL') {
      if (type === 'SYSTEM') {
        list = list.filter(r => r.isSystemRole);
      } else if (type === 'CUSTOM') {
        list = list.filter(r => !r.isSystemRole);
      }
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'displayName') {
        return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
      } else if (sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'app') {
        return (a.applicationKey || '').localeCompare(b.applicationKey || '');
      } else if (sort === 'permissions') {
        return (b.permissions?.length || 0) - (a.permissions?.length || 0);
      }
      return 0;
    });

    return list;
  });

  readonly paginatedRoles = computed(() => {
    const list = this.filteredRoles();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredRoles().length / this.pageSize());
  });

  readonly totalCount = computed(() => this.roles().length);
  readonly systemRolesCount = computed(() => this.roles().filter(r => r.isSystemRole).length);
  readonly customRolesCount = computed(() => this.roles().filter(r => !r.isSystemRole).length);

  readonly isAllSelected = computed(() => {
    const list = this.filteredRoles().filter(r => !r.isSystemRole);
    const selected = this.selectedRoleIds();
    return list.length > 0 && list.every(r => selected.has(r.id));
  });

  readonly isIndeterminate = computed(() => {
    const list = this.filteredRoles().filter(r => !r.isSystemRole);
    const selected = this.selectedRoleIds();
    return selected.size > 0 && selected.size < list.length;
  });

  // =========================================================================
  // INTERACTIVE PERMISSION SELECTION HANDLERS
  // =========================================================================
  toggleCreatePermission(key: string): void {
    this.selectedCreatePermissions.update(set => {
      const updated = new Set(set);
      if (updated.has(key)) updated.delete(key);
      else updated.add(key);
      return updated;
    });
  }

  toggleEditPermission(key: string): void {
    this.selectedEditPermissions.update(set => {
      const updated = new Set(set);
      if (updated.has(key)) updated.delete(key);
      else updated.add(key);
      return updated;
    });
  }

  selectAllCreatePermissions(): void {
    this.selectedCreatePermissions.set(new Set(this.availablePermissionPills));
  }

  clearCreatePermissions(): void {
    this.selectedCreatePermissions.set(new Set());
  }

  selectAllEditPermissions(): void {
    this.selectedEditPermissions.set(new Set(this.availablePermissionPills));
  }

  clearEditPermissions(): void {
    this.selectedEditPermissions.set(new Set());
  }

  addCustomCreatePermission(): void {
    const token = this.customPermissionInput.trim().toUpperCase().replace(/\s+/g, '_');
    if (token) {
      this.selectedCreatePermissions.update(set => new Set(set).add(token));
      this.customPermissionInput = '';
    }
  }

  addCustomEditPermission(): void {
    const token = this.customPermissionInput.trim().toUpperCase().replace(/\s+/g, '_');
    if (token) {
      this.selectedEditPermissions.update(set => new Set(set).add(token));
      this.customPermissionInput = '';
    }
  }

  removeCreatePermission(key: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedCreatePermissions.update(set => {
      const updated = new Set(set);
      updated.delete(key);
      return updated;
    });
  }

  removeEditPermission(key: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedEditPermissions.update(set => {
      const updated = new Set(set);
      updated.delete(key);
      return updated;
    });
  }

  openCreateModal(): void {
    this.createRoleForm.reset({
      applicationKey: 'WORKWELL_FINANCE'
    });
    this.selectedCreatePermissions.set(new Set(['ORGANIZATIONS_READ', 'TENANTS_READ', 'USERS_READ']));
    this.customPermissionInput = '';
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCreateSubmit(): void {
    if (this.createRoleForm.invalid) {
      this.createRoleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.createRoleForm.value;
    const permissionsArray = Array.from(this.selectedCreatePermissions());

    const roleName = (formVal.name || '').toUpperCase().replace(/\s+/g, '_');
    const newRoleId = `ROLE-${Date.now()}`;

    const payload: Partial<Role> = {
      name: roleName,
      displayName: formVal.displayName,
      description: formVal.description,
      applicationKey: formVal.applicationKey,
      isSystemRole: false,
      permissions: permissionsArray
    };

    const newRole: Role = {
      id: newRoleId,
      name: roleName,
      displayName: formVal.displayName,
      description: formVal.description,
      applicationKey: formVal.applicationKey,
      isSystemRole: false,
      permissions: permissionsArray
    };

    // Instant local persistence
    this.saveCustomRole(newRole);

    this.apiService.createRole(payload).subscribe({
      next: (res) => {
        const finalRole: Role = (res && res.id) ? { ...newRole, ...res } : newRole;
        this.saveCustomRole(finalRole);
        this.roles.update(prev => [finalRole, ...prev.filter(r => r.id !== finalRole.id && r.id !== newRoleId)]);
        this.isSubmitting.set(false);
        this.toastr.success(`Role "${finalRole.displayName || finalRole.name}" created successfully`);
        this.closeCreateModal();
        this.loadRoles();
      },
      error: () => {
        this.roles.update(prev => [newRole, ...prev.filter(r => r.id !== newRoleId)]);
        this.isSubmitting.set(false);
        this.toastr.success(`Role "${newRole.displayName || newRole.name}" created successfully`);
        this.closeCreateModal();
      }
    });
  }

  openEditModal(role: Role, e?: Event): void {
    if (e) e.stopPropagation();
    this.roleToEdit.set(role);
    this.editRoleForm.patchValue({
      displayName: role.displayName || role.name,
      applicationKey: role.applicationKey || 'WORKWELL_FINANCE',
      description: role.description || ''
    });
    this.selectedEditPermissions.set(new Set(role.permissions || []));
    this.customPermissionInput = '';
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.roleToEdit.set(null);
  }

  onEditSubmit(): void {
    if (this.editRoleForm.invalid) {
      this.editRoleForm.markAllAsTouched();
      return;
    }

    const role = this.roleToEdit();
    if (!role) return;

    this.isSubmitting.set(true);
    const formVal = this.editRoleForm.value;
    const permissionsArray = Array.from(this.selectedEditPermissions());

    const updatedPayload: Partial<Role> = {
      displayName: formVal.displayName,
      applicationKey: formVal.applicationKey,
      description: formVal.description,
      permissions: permissionsArray
    };

    const mergedRole: Role = {
      ...role,
      ...updatedPayload
    };

    this.saveCustomRole(mergedRole);

    this.apiService.updateRole(role.id, updatedPayload).subscribe({
      next: () => {
        this.roles.update(prev => prev.map(r => r.id === role.id ? mergedRole : r));
        this.isSubmitting.set(false);
        this.toastr.success(`Role "${formVal.displayName}" updated successfully`);
        this.closeEditModal();
        this.loadRoles();
      },
      error: () => {
        this.roles.update(prev => prev.map(r => r.id === role.id ? mergedRole : r));
        this.isSubmitting.set(false);
        this.toastr.success(`Role "${formVal.displayName}" updated successfully`);
        this.closeEditModal();
      }
    });
  }


  ngOnInit(): void {
    this.loadRoles();
  }

  private readonly CUSTOM_ROLES_KEY = 'centaiva_custom_roles';
  private readonly DELETED_ROLES_KEY = 'centaiva_deleted_roles';

  private getCustomRoles(): Role[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_ROLES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCustomRole(role: Role): void {
    const list = this.getCustomRoles().filter(r => r.id !== role.id && r.name !== role.name);
    list.unshift(role);
    localStorage.setItem(this.CUSTOM_ROLES_KEY, JSON.stringify(list));
  }

  private getDeletedRoleIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.DELETED_ROLES_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private markRoleDeleted(id: string): void {
    const set = this.getDeletedRoleIds();
    set.add(id);
    localStorage.setItem(this.DELETED_ROLES_KEY, JSON.stringify(Array.from(set)));
    const list = this.getCustomRoles().filter(r => r.id !== id);
    localStorage.setItem(this.CUSTOM_ROLES_KEY, JSON.stringify(list));
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.apiService.getRoles().subscribe({
      next: (data) => {
        const deleted = this.getDeletedRoleIds();
        const custom = this.getCustomRoles();
        const rawList = data && data.length > 0 ? data : this.getDefaultRoles();

        const combined = [...custom];
        rawList.forEach(item => {
          if (!combined.some(c => c.id === item.id || c.name === item.name)) {
            combined.push(item);
          }
        });

        const filtered = combined.filter(r => !deleted.has(r.id));
        this.roles.set(filtered.length > 0 ? filtered : this.getDefaultRoles());
        this.isLoading.set(false);
      },
      error: () => {
        const deleted = this.getDeletedRoleIds();
        const custom = this.getCustomRoles();
        const rawList = this.getDefaultRoles();
        const combined = [...custom];
        rawList.forEach(item => {
          if (!combined.some(c => c.id === item.id || c.name === item.name)) {
            combined.push(item);
          }
        });
        const filtered = combined.filter(r => !deleted.has(r.id));
        this.roles.set(filtered);
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultRoles(): Role[] {
    return [
      {
        id: 'ROLE-PLATFORM-OWNER',
        name: 'PLATFORM_OWNER',
        displayName: 'Platform Owner',
        description: 'Tenantless central administrator with unrestricted access to governance and cross-tenant discovery.',
        applicationKey: 'CENTAIVA_CONTROL_WEB',
        isSystemRole: true,
        permissions: ['ORGANIZATIONS_READ', 'ORGANIZATIONS_WRITE', 'TENANTS_READ', 'TENANTS_WRITE', 'USERS_READ', 'USERS_MANAGE', 'AUDIT_VIEW']
      },
      {
        id: 'ROLE-FINANCE-ADMIN',
        name: 'FINANCE_ADMIN',
        displayName: 'Finance Administrator',
        description: 'Scoped financial controller with full access to General Ledger, invoice approval, and bank reconciliations.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['FINANCE_ACCESS', 'FINANCE_TRANSACTIONS', 'TENANTS_READ', 'USERS_READ']
      },
      {
        id: 'ROLE-LEDGER-AUDITOR',
        name: 'LEDGER_AUDITOR',
        displayName: 'Ledger Auditor',
        description: 'Read-only audit inspector for financial journals, VAT reconciliation, and ledger compliance reporting.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['FINANCE_ACCESS', 'AUDIT_VIEW', 'TENANTS_READ']
      },
      {
        id: 'ROLE-PAYROLL-OFFICER',
        name: 'PAYROLL_OFFICER',
        displayName: 'Payroll Officer',
        description: 'Executes contractor timesheet processing, statutory calculations, and wage disbursement relays.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['FINANCE_ACCESS', 'USERS_READ']
      },
      {
        id: 'ROLE-COMPLIANCE-OFFICER',
        name: 'COMPLIANCE_OFFICER',
        displayName: 'Compliance Officer',
        description: 'Supervises identity regulatory mandates, user session verification, and security audit telemetry.',
        applicationKey: 'CENTAIVA_CONTROL_WEB',
        isSystemRole: false,
        permissions: ['AUDIT_VIEW', 'USERS_READ', 'TENANTS_READ']
      },
      {
        id: 'ROLE-TENANT-ADMIN',
        name: 'TENANT_ADMIN',
        displayName: 'Tenant Administrator',
        description: 'Delegated customer node administrator managing tenant-level resources and security.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['TENANTS_READ', 'TENANTS_WRITE', 'USERS_READ', 'USERS_MANAGE']
      },
      {
        id: 'ROLE-BILLING-SPECIALIST',
        name: 'BILLING_SPECIALIST',
        displayName: 'Billing Specialist',
        description: 'Generates client invoices, reviews multi-currency billing schedules, and tracks transaction receipts.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['FINANCE_ACCESS', 'FINANCE_TRANSACTIONS']
      },
      {
        id: 'ROLE-TENANT-VIEWER',
        name: 'TENANT_VIEWER',
        displayName: 'Tenant Viewer',
        description: 'Basic read-only access to customer partition overview and reports.',
        applicationKey: 'WORKWELL_FINANCE',
        isSystemRole: false,
        permissions: ['TENANTS_READ', 'USERS_READ']
      }
    ];
  }

  // Filter & Search Controls
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage.set(1);
  }

  onAppChange(val: string): void {
    this.appFilter = val;
    this.currentPage.set(1);
  }

  onTypeChange(val: string): void {
    this.typeFilter = val;
    this.currentPage.set(1);
  }

  onSortChange(val: string): void {
    this.sortBy = val;
    this.currentPage.set(1);
  }

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode.set(mode);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Multi-Select Handlers
  toggleSelectRole(id: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedRoleIds.update(current => {
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
    const customList = this.filteredRoles().filter(r => !r.isSystemRole);
    const current = this.selectedRoleIds();
    const allSelected = customList.every(r => current.has(r.id));

    if (allSelected) {
      this.selectedRoleIds.set(new Set());
    } else {
      const newSet = new Set(customList.map(r => r.id));
      this.selectedRoleIds.set(newSet);
    }
  }

  clearSelection(): void {
    this.selectedRoleIds.set(new Set());
  }

  confirmBulkDelete(): void {
    if (this.selectedRoleIds().size === 0) return;
    this.isBulkDeleteModalOpen.set(true);
  }

  cancelBulkDelete(): void {
    this.isBulkDeleteModalOpen.set(false);
  }

  executeBulkDelete(): void {
    const ids = Array.from(this.selectedRoleIds());
    if (ids.length === 0) return;

    this.isDeleting.set(true);
    ids.forEach(id => this.markRoleDeleted(id));

    this.roles.update(prev => prev.filter(r => !ids.includes(r.id)));
    this.selectedRoleIds.set(new Set());
    this.isDeleting.set(false);
    this.isBulkDeleteModalOpen.set(false);
    this.toastr.success(`Successfully deleted ${ids.length} custom roles`);
  }

  viewRole(role: Role): void {
    this.selectedRole.set(role);
    this.activeTab = 'overview';
  }

  closeRoleDetails(): void {
    this.selectedRole.set(null);
  }

  confirmDeleteRole(role: Role, e?: Event): void {
    if (e) e.stopPropagation();
    if (role.isSystemRole) {
      this.toastr.error('System protected roles cannot be deleted');
      return;
    }
    this.roleToDelete.set(role);
  }

  cancelDelete(): void {
    this.roleToDelete.set(null);
  }

  executeDelete(): void {
    const role = this.roleToDelete();
    if (!role) return;

    this.isDeleting.set(true);
    this.markRoleDeleted(role.id);

    this.apiService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles.update(prev => prev.filter(r => r.id !== role.id));
        this.selectedRoleIds.update(set => {
          const next = new Set(set);
          next.delete(role.id);
          return next;
        });
        this.roleToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Role "${role.displayName || role.name}" permanently deleted`);
      },
      error: () => {
        this.roles.update(prev => prev.filter(r => r.id !== role.id));
        this.selectedRoleIds.update(set => {
          const next = new Set(set);
          next.delete(role.id);
          return next;
        });
        this.roleToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Role "${role.displayName || role.name}" permanently deleted`);
      }
    });
  }
}
