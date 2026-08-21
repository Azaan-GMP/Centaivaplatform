import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Application, Feature, Permission, Product, ProductModule } from '../../core/models';
import { ApplicationsService, ProductsService } from '../../core/services/data-contracts';
import {
  DefinitionItem,
  DefinitionListComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  SearchInputComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '../../shared';

export type CatalogLevel = 'product' | 'application' | 'module' | 'feature' | 'permission';

export interface CatalogNode {
  id: string;
  label: string;
  key: string;
  level: CatalogLevel;
  depth: number;
  status?: string;
  meta?: string;
  children: CatalogNode[];
  payload: Product | Application | ProductModule | Feature | Permission;
}

@Component({
  selector: 'ctv-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    SearchInputComponent,
    DefinitionListComponent,
    EmptyStateComponent,
  ],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.scss',
})
export class CatalogPage {
  private readonly products = inject(ProductsService);
  private readonly applications = inject(ApplicationsService);

  readonly loading = signal(true);
  readonly search = signal('');
  readonly selectedId = signal<string | null>(null);
  readonly expandedIds = signal<ReadonlySet<string>>(new Set<string>());

  private readonly productList = signal<Product[]>([]);
  private readonly applicationList = signal<Application[]>([]);

  /** Product > Application > Module > Feature > Permission, built once from the catalogue. */
  readonly tree = computed<CatalogNode[]>(() =>
    this.productList().map((product) => {
      const productApplications = this.applicationList().filter(
        (application) => application.productKey === product.key,
      );

      return {
        id: product.id,
        label: product.name,
        key: product.key,
        level: 'product' as CatalogLevel,
        depth: 0,
        status: product.status,
        meta: `${product.applicationCount} applications · ${product.permissionCount} permissions`,
        payload: product,
        children: productApplications.map((application) => ({
          id: application.id,
          label: application.name,
          key: application.key,
          level: 'application' as CatalogLevel,
          depth: 1,
          status: application.status,
          meta: `${application.type} · ${application.moduleCount} modules`,
          payload: application,
          children: application.modules.map((module) => ({
            id: module.id,
            label: module.name,
            key: module.key,
            level: 'module' as CatalogLevel,
            depth: 2,
            status: module.status,
            meta: `${module.features.length} features`,
            payload: module,
            children: module.features.map((feature) => ({
              id: feature.id,
              label: feature.name,
              key: feature.key,
              level: 'feature' as CatalogLevel,
              depth: 3,
              status: feature.status,
              meta: `${feature.permissions.length} permissions`,
              payload: feature,
              children: feature.permissions.map((permission) => ({
                id: permission.id,
                label: permission.key,
                key: permission.key,
                level: 'permission' as CatalogLevel,
                depth: 4,
                status: permission.risk,
                meta: permission.name,
                payload: permission,
                children: [],
              })),
            })),
          })),
        })),
      };
    }),
  );

  /** Flattened rows honouring expansion and the search filter. */
  readonly visibleRows = computed<CatalogNode[]>(() => {
    const term = this.search().toLowerCase().trim();
    const expanded = this.expandedIds();
    const rows: CatalogNode[] = [];

    const matches = (node: CatalogNode): boolean => {
      if (!term) return true;
      const own = `${node.label} ${node.key} ${node.meta ?? ''}`.toLowerCase();
      return own.includes(term) || node.children.some(matches);
    };

    const walk = (nodes: CatalogNode[]): void => {
      for (const node of nodes) {
        if (!matches(node)) continue;
        rows.push(node);
        if (expanded.has(node.id) || term) {
          walk(node.children);
        }
      }
    };

    walk(this.tree());
    return rows;
  });

  readonly selected = computed<CatalogNode | null>(() => {
    const id = this.selectedId();
    if (!id) return null;

    const find = (nodes: CatalogNode[]): CatalogNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const child = find(node.children);
        if (child) return child;
      }
      return null;
    };

    return find(this.tree());
  });

  readonly selectedPath = computed<string[]>(() => {
    const id = this.selectedId();
    if (!id) return [];

    const path: string[] = [];
    const find = (nodes: CatalogNode[], trail: string[]): boolean => {
      for (const node of nodes) {
        const next = [...trail, node.label];
        if (node.id === id) {
          path.push(...next);
          return true;
        }
        if (find(node.children, next)) return true;
      }
      return false;
    };

    find(this.tree(), []);
    return path;
  });

  readonly detailItems = computed<DefinitionItem[]>(() => {
    const node = this.selected();
    if (!node) return [];

    const base: DefinitionItem[] = [
      { label: 'Name', value: node.label },
      { label: 'Key', value: node.key, mono: true },
      { label: 'Level', value: this.levelLabel(node.level) },
      { label: 'Identifier', value: node.id, mono: true },
    ];

    if (node.level === 'permission') {
      const permission = node.payload as Permission;
      base.push(
        { label: 'Display name', value: permission.name },
        { label: 'Risk', value: permission.risk },
        { label: 'Product', value: permission.productKey, mono: true },
      );
    }

    if (node.level === 'application') {
      const application = node.payload as Application;
      base.push(
        { label: 'Type', value: application.type },
        { label: 'Version', value: application.version },
        { label: 'Base URL', value: application.baseUrl, mono: true },
      );
    }

    if (node.level === 'product') {
      const product = node.payload as Product;
      base.push(
        { label: 'Owner', value: product.owner },
        { label: 'Lifecycle', value: product.lifecycle },
        { label: 'Version', value: product.version },
      );
    }

    return base;
  });

  readonly description = computed(() => {
    const node = this.selected();
    if (!node) return '';
    const payload = node.payload as { description?: string };
    return payload.description ?? '';
  });

  readonly stats = computed(() => {
    const flatten = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes.flatMap((node) => [node, ...flatten(node.children)]);
    const all = flatten(this.tree());

    return {
      products: all.filter((node) => node.level === 'product').length,
      applications: all.filter((node) => node.level === 'application').length,
      modules: all.filter((node) => node.level === 'module').length,
      features: all.filter((node) => node.level === 'feature').length,
      permissions: all.filter((node) => node.level === 'permission').length,
    };
  });

  constructor() {
    this.products.all().subscribe((products) => {
      this.productList.set(products);
      // Open the first product and its first application so the tree reads immediately.
      const first = products[0];
      if (first) {
        this.expandedIds.update((current) => new Set([...current, first.id]));
        this.selectedId.set(first.id);
      }
    });

    this.applications.all().subscribe((applications) => {
      this.applicationList.set(applications);
      const first = applications[0];
      if (first) {
        this.expandedIds.update((current) => new Set([...current, first.id, ...first.modules.map((m) => m.id)]));
      }
      this.loading.set(false);
    });
  }

  toggle(node: CatalogNode, event: Event): void {
    event.stopPropagation();
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }

  select(node: CatalogNode): void {
    this.selectedId.set(node.id);
  }

  isExpanded(node: CatalogNode): boolean {
    return this.expandedIds().has(node.id) || !!this.search().trim();
  }

  expandAll(): void {
    const flatten = (nodes: CatalogNode[]): string[] =>
      nodes.flatMap((node) => [node.id, ...flatten(node.children)]);
    this.expandedIds.set(new Set(flatten(this.tree())));
  }

  collapseAll(): void {
    this.expandedIds.set(new Set());
  }

  levelLabel(level: CatalogLevel): string {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  levelIcon(level: CatalogLevel): string {
    switch (level) {
      case 'product':
        return 'pi pi-box';
      case 'application':
        return 'pi pi-desktop';
      case 'module':
        return 'pi pi-th-large';
      case 'feature':
        return 'pi pi-sparkles';
      default:
        return 'pi pi-key';
    }
  }
}
