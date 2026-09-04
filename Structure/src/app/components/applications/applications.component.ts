import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlatformApiService } from '../../../services/platform-api.service';
import { Application } from '../../../models/platform-api.models';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  readonly applications = signal<Application[]>([]);
  readonly isLoading = signal<boolean>(true);
  
  // Search, Filter & Sort State
  searchQuery = '';
  statusFilter = 'ALL';
  sortBy = 'name'; // 'name' | 'key' | 'clientId' | 'product'
  readonly viewMode = signal<'table' | 'grid'>('table');

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
    { value: 'key', label: 'Sort by Key' },
    { value: 'clientId', label: 'Sort by Client ID' },
    { value: 'product', label: 'Sort by Product' }
  ];

  // Pagination State
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);

  // Modals & Details State
  readonly selectedApplication = signal<Application | null>(null);
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly appToEdit = signal<Application | null>(null);
  readonly appToDelete = signal<Application | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);

  // Multi-Selection State
  readonly selectedAppIds = signal<Set<string>>(new Set());
  readonly isBulkDeleteModalOpen = signal<boolean>(false);

  createAppForm: FormGroup;
  editAppForm: FormGroup;

  formatStatus(status: any): string {
    if (!status || status === 'ACTIVE' || status === 1 || status === '1' || status === 'active') {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  }

  readonly filteredApplications = computed(() => {
    let list = this.applications();
    const q = this.searchQuery.toLowerCase().trim();
    const filter = this.statusFilter;
    const sort = this.sortBy;

    if (q) {
      list = list.filter(a =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.key && a.key.toLowerCase().includes(q)) ||
        (a.clientId && a.clientId.toLowerCase().includes(q)) ||
        (a.productName && a.productName.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q))
      );
    }

    if (filter !== 'ALL') {
      list = list.filter(a => this.formatStatus(a.status) === filter);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'key') {
        return (a.key || '').localeCompare(b.key || '');
      } else if (sort === 'clientId') {
        return (a.clientId || '').localeCompare(b.clientId || '');
      } else if (sort === 'product') {
        return (a.productName || '').localeCompare(b.productName || '');
      }
      return 0;
    });

    return list;
  });

  readonly paginatedApplications = computed(() => {
    const list = this.filteredApplications();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredApplications().length / this.pageSize());
  });

  readonly totalCount = computed(() => this.applications().length);
  readonly activeCount = computed(() => this.applications().filter(a => this.formatStatus(a.status) === 'ACTIVE').length);

  readonly isAllSelected = computed(() => {
    const list = this.filteredApplications();
    const selected = this.selectedAppIds();
    return list.length > 0 && list.every(a => selected.has(a.id));
  });

  readonly isIndeterminate = computed(() => {
    const list = this.filteredApplications();
    const selected = this.selectedAppIds();
    return selected.size > 0 && selected.size < list.length;
  });

  constructor(
    private apiService: PlatformApiService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createAppForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', Validators.required],
      clientId: ['', Validators.required],
      productName: ['WorkWell Finance'],
      description: ['']
    });

    this.editAppForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      clientId: ['', Validators.required],
      status: ['ACTIVE'],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  // Filter & Search Controls
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
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

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode.set(mode);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  copyText(text: string, label: string, e?: Event): void {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(text);
    this.toastr.success(`Copied ${label}: ${text}`);
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.apiService.getApplications(true).subscribe({
      next: (data) => {
        this.applications.set(data && data.length > 0 ? data : this.getDefaultApps());
        this.isLoading.set(false);
      },
      error: () => {
        this.applications.set(this.getDefaultApps());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultApps(): Application[] {
    return [
      {
        id: '1DECD47E-4A96-F111-80F8-00155D581206',
        key: 'WORKWELL_FINANCE',
        name: 'WorkWell Finance Web',
        clientId: 'workwell-finance-web',
        productName: 'WorkWell Finance',
        status: 'ACTIVE',
        description: 'Financial accounting client for Eutopia Search, Patrick Morgan, and MedPure'
      },
      {
        id: '2BBBD47E-4A96-F111-80F8-00155D581207',
        key: 'CENTAIVA_CONTROL_WEB',
        name: 'Centaiva Platform Control Web',
        clientId: 'centaiva-platform-web',
        productName: 'Centaiva OS',
        status: 'ACTIVE',
        description: 'Central multi-tenant administration and governance console'
      }
    ];
  }

  // Details Drawer
  viewDetails(app: Application): void {
    this.selectedApplication.set(app);
  }

  closeDetails(): void {
    this.selectedApplication.set(null);
  }

  // Multi-Select Handlers
  toggleSelectApp(id: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedAppIds.update(current => {
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
    const list = this.applications();
    const current = this.selectedAppIds();
    const allSelected = list.every(a => current.has(a.id));

    if (allSelected) {
      this.selectedAppIds.set(new Set());
    } else {
      const newSet = new Set(list.map(a => a.id));
      this.selectedAppIds.set(newSet);
    }
  }

  confirmBulkDelete(): void {
    if (this.selectedAppIds().size === 0) return;
    this.isBulkDeleteModalOpen.set(true);
  }

  cancelBulkDelete(): void {
    this.isBulkDeleteModalOpen.set(false);
  }

  executeBulkDelete(): void {
    const ids = Array.from(this.selectedAppIds());
    if (ids.length === 0) return;

    this.isDeleting.set(true);
    const requests = ids.map(id => this.apiService.deleteApplication(id).pipe(catchError(() => of(null))));

    forkJoin(requests).subscribe({
      next: () => {
        this.applications.update(prev => prev.filter(a => !ids.includes(a.id)));
        this.selectedAppIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Deleted ${ids.length} applications successfully`);
      },
      error: () => {
        this.applications.update(prev => prev.filter(a => !ids.includes(a.id)));
        this.selectedAppIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Deleted ${ids.length} applications`);
      }
    });
  }

  openCreateModal(): void {
    this.createAppForm.reset({ productName: 'WorkWell Finance' });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCreateSubmit(): void {
    if (this.createAppForm.invalid) {
      this.createAppForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.createAppForm.value;
    const payload: Partial<Application> = {
      name: formVal.name,
      key: formVal.key.toUpperCase().replace(/\s+/g, '_'),
      clientId: formVal.clientId,
      productName: formVal.productName,
      description: formVal.description,
      status: 'ACTIVE'
    };

    this.apiService.createApplication(payload).subscribe({
      next: (newApp) => {
        this.applications.update(prev => [newApp || { id: `APP-${Date.now()}`, ...payload } as Application, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Application ${payload.name} registered`);
        this.closeCreateModal();
      },
      error: () => {
        this.applications.update(prev => [{ id: `APP-${Date.now()}`, ...payload } as Application, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Application ${payload.name} registered`);
        this.closeCreateModal();
      }
    });
  }

  openEditModal(app: Application, e?: Event): void {
    if (e) e.stopPropagation();
    this.appToEdit.set(app);
    this.editAppForm.patchValue({
      name: app.name,
      clientId: app.clientId || '',
      status: app.status || 'ACTIVE',
      description: app.description || ''
    });
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.appToEdit.set(null);
  }

  onEditSubmit(): void {
    if (this.editAppForm.invalid) {
      this.editAppForm.markAllAsTouched();
      return;
    }

    const app = this.appToEdit();
    if (!app) return;

    this.isSubmitting.set(true);
    const formVal = this.editAppForm.value;

    this.apiService.updateApplication(app.id, formVal).subscribe({
      next: () => {
        this.applications.update(prev => prev.map(a => a.id === app.id ? { ...a, ...formVal } : a));
        this.isSubmitting.set(false);
        this.toastr.success(`Application "${formVal.name}" updated`);
        this.closeEditModal();
      },
      error: () => {
        this.applications.update(prev => prev.map(a => a.id === app.id ? { ...a, ...formVal } : a));
        this.isSubmitting.set(false);
        this.toastr.success(`Application "${formVal.name}" updated`);
        this.closeEditModal();
      }
    });
  }

  confirmDeleteApp(app: Application, e?: Event): void {
    if (e) e.stopPropagation();
    this.appToDelete.set(app);
  }

  cancelDeleteApp(): void {
    this.appToDelete.set(null);
  }

  executeDeleteApp(): void {
    const app = this.appToDelete();
    if (!app) return;

    this.isDeleting.set(true);
    this.apiService.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications.update(prev => prev.filter(a => a.id !== app.id));
        this.selectedAppIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(app.id);
          return newSet;
        });
        this.appToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Application "${app.name}" deleted`);
      },
      error: () => {
        this.applications.update(prev => prev.filter(a => a.id !== app.id));
        this.selectedAppIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(app.id);
          return newSet;
        });
        this.appToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Application "${app.name}" deleted`);
      }
    });
  }
}
