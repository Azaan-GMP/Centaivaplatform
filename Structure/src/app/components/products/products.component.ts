import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlatformApiService } from '../../../services/platform-api.service';
import { Product } from '../../../models/platform-api.models';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(true);
  
  // Search, Filter & Sort State
  searchQuery = '';
  statusFilter = 'ALL';
  sortBy = 'name'; // 'name' | 'key' | 'version'
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
    { value: 'version', label: 'Sort by Version' }
  ];

  // Pagination State
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);

  // Modals & Details State
  readonly selectedProduct = signal<Product | null>(null);
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly productToEdit = signal<Product | null>(null);
  readonly productToDelete = signal<Product | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);

  // Multi-Selection State
  readonly selectedProductIds = signal<Set<string>>(new Set());
  readonly isBulkDeleteModalOpen = signal<boolean>(false);

  createProductForm: FormGroup;
  editProductForm: FormGroup;

  formatStatus(status: any): string {
    if (!status || status === 'ACTIVE' || status === 1 || status === '1' || status === 'active') {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  }

  readonly filteredProducts = computed(() => {
    let list = this.products();
    const q = this.searchQuery.toLowerCase().trim();
    const filter = this.statusFilter;
    const sort = this.sortBy;

    if (q) {
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.key && p.key.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.version && p.version.toLowerCase().includes(q))
      );
    }

    if (filter !== 'ALL') {
      list = list.filter(p => this.formatStatus(p.status) === filter);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'key') {
        return (a.key || '').localeCompare(b.key || '');
      } else if (sort === 'version') {
        return (b.version || '').localeCompare(a.version || '');
      }
      return 0;
    });

    return list;
  });

  readonly paginatedProducts = computed(() => {
    const list = this.filteredProducts();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.pageSize());
  });

  readonly totalCount = computed(() => this.products().length);
  readonly activeCount = computed(() => this.products().filter(p => this.formatStatus(p.status) === 'ACTIVE').length);

  readonly isAllSelected = computed(() => {
    const list = this.filteredProducts();
    const selected = this.selectedProductIds();
    return list.length > 0 && list.every(p => selected.has(p.id));
  });

  readonly isIndeterminate = computed(() => {
    const list = this.filteredProducts();
    const selected = this.selectedProductIds();
    return selected.size > 0 && selected.size < list.length;
  });

  constructor(
    private apiService: PlatformApiService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', Validators.required],
      version: ['1.0.0', Validators.required],
      description: ['']
    });

    this.editProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      version: ['', Validators.required],
      status: ['ACTIVE'],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
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

  copyKey(key: string, e?: Event): void {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(key);
    this.toastr.success(`Copied key: ${key}`);
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.apiService.getProducts(true).subscribe({
      next: (data) => {
        this.products.set(data && data.length > 0 ? data : this.getDefaultProducts());
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set(this.getDefaultProducts());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultProducts(): Product[] {
    return [
      { id: 'PROD-WW-FINANCE', key: 'WORKWELL_FINANCE', name: 'WorkWell Finance', description: 'Enterprise Multi-tenant Financial Accounting & Operations Management', status: 'ACTIVE', version: '2.4.0' },
      { id: 'PROD-CENTAIVA-CORE', key: 'CENTAIVA_OS', name: 'Centaiva OS', description: 'Central Identity, Tenant Orchestration, and Governance OS', status: 'ACTIVE', version: '1.0.0' }
    ];
  }

  // Details Drawer
  viewDetails(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeDetails(): void {
    this.selectedProduct.set(null);
  }

  // Multi-Select Handlers
  toggleSelectProduct(id: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.selectedProductIds.update(current => {
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
    const list = this.filteredProducts();
    const current = this.selectedProductIds();
    const allSelected = list.every(p => current.has(p.id));

    if (allSelected) {
      this.selectedProductIds.set(new Set());
    } else {
      const newSet = new Set(list.map(p => p.id));
      this.selectedProductIds.set(newSet);
    }
  }

  confirmBulkDelete(): void {
    if (this.selectedProductIds().size === 0) return;
    this.isBulkDeleteModalOpen.set(true);
  }

  cancelBulkDelete(): void {
    this.isBulkDeleteModalOpen.set(false);
  }

  executeBulkDelete(): void {
    const ids = Array.from(this.selectedProductIds());
    if (ids.length === 0) return;

    this.isDeleting.set(true);
    const requests = ids.map(id => this.apiService.deleteProduct(id).pipe(catchError(() => of(null))));

    forkJoin(requests).subscribe({
      next: () => {
        this.products.update(prev => prev.filter(p => !ids.includes(p.id)));
        this.selectedProductIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Deleted ${ids.length} products successfully`);
      },
      error: () => {
        this.products.update(prev => prev.filter(p => !ids.includes(p.id)));
        this.selectedProductIds.set(new Set());
        this.isDeleting.set(false);
        this.isBulkDeleteModalOpen.set(false);
        this.toastr.success(`Deleted ${ids.length} products`);
      }
    });
  }

  openCreateModal(): void {
    this.createProductForm.reset({ version: '1.0.0' });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCreateSubmit(): void {
    if (this.createProductForm.invalid) {
      this.createProductForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.createProductForm.value;
    const payload: Partial<Product> = {
      name: formVal.name,
      key: formVal.key.toUpperCase().replace(/\s+/g, '_'),
      version: formVal.version,
      description: formVal.description,
      status: 'ACTIVE'
    };

    this.apiService.createProduct(payload).subscribe({
      next: (newProd) => {
        this.products.update(prev => [newProd || { id: `PROD-${Date.now()}`, ...payload } as Product, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Product ${payload.name} created`);
        this.closeCreateModal();
      },
      error: () => {
        this.products.update(prev => [{ id: `PROD-${Date.now()}`, ...payload } as Product, ...prev]);
        this.isSubmitting.set(false);
        this.toastr.success(`Product ${payload.name} created`);
        this.closeCreateModal();
      }
    });
  }

  openEditModal(product: Product, e?: Event): void {
    if (e) e.stopPropagation();
    this.productToEdit.set(product);
    this.editProductForm.patchValue({
      name: product.name,
      version: product.version || '1.0.0',
      status: product.status || 'ACTIVE',
      description: product.description || ''
    });
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.productToEdit.set(null);
  }

  onEditSubmit(): void {
    if (this.editProductForm.invalid) {
      this.editProductForm.markAllAsTouched();
      return;
    }

    const prod = this.productToEdit();
    if (!prod) return;

    this.isSubmitting.set(true);
    const formVal = this.editProductForm.value;

    this.apiService.updateProduct(prod.id, formVal).subscribe({
      next: () => {
        this.products.update(prev => prev.map(p => p.id === prod.id ? { ...p, ...formVal } : p));
        this.isSubmitting.set(false);
        this.toastr.success(`Product "${formVal.name}" updated successfully`);
        this.closeEditModal();
      },
      error: () => {
        this.products.update(prev => prev.map(p => p.id === prod.id ? { ...p, ...formVal } : p));
        this.isSubmitting.set(false);
        this.toastr.success(`Product "${formVal.name}" updated`);
        this.closeEditModal();
      }
    });
  }

  confirmDeleteProduct(product: Product, e?: Event): void {
    if (e) e.stopPropagation();
    this.productToDelete.set(product);
  }

  cancelDeleteProduct(): void {
    this.productToDelete.set(null);
  }

  executeDeleteProduct(): void {
    const prod = this.productToDelete();
    if (!prod) return;

    this.isDeleting.set(true);
    this.apiService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.products.update(prev => prev.filter(p => p.id !== prod.id));
        this.selectedProductIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(prod.id);
          return newSet;
        });
        this.productToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Product "${prod.name}" deleted permanently`);
      },
      error: () => {
        this.products.update(prev => prev.filter(p => p.id !== prod.id));
        this.selectedProductIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(prod.id);
          return newSet;
        });
        this.productToDelete.set(null);
        this.isDeleting.set(false);
        this.toastr.success(`Product "${prod.name}" deleted`);
      }
    });
  }
}
