import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { OrganizationNode } from '../../core/models';

export interface TreeNodeEvent {
  id: string;
}

/**
 * Self-referencing tree row. The hierarchy is recursive with no depth limit,
 * so the component renders itself for each child level.
 */
@Component({
  selector: 'ctv-org-tree-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrgTreeNodeComponent],
  template: `
    @if (visible()) {
      <div class="node">
        <div
          class="node__row"
          [class.node__row--selected]="selectedId() === node().organization.id"
          [style.padding-left.px]="8 + node().depth * 14"
          role="treeitem"
          [attr.aria-expanded]="hasChildren() ? isExpanded() : null"
          [attr.aria-selected]="selectedId() === node().organization.id"
          tabindex="0"
          (click)="select.emit({ id: node().organization.id })"
          (keydown.enter)="select.emit({ id: node().organization.id })"
        >
          @if (hasChildren()) {
            <button
              type="button"
              class="node__toggle"
              [attr.aria-label]="isExpanded() ? 'Collapse' : 'Expand'"
              (click)="toggle.emit({ id: node().organization.id }); $event.stopPropagation()"
            >
              <i class="pi" [class.pi-chevron-down]="isExpanded()" [class.pi-chevron-right]="!isExpanded()" aria-hidden="true"></i>
            </button>
          } @else {
            <span class="node__toggle node__toggle--leaf" aria-hidden="true"></span>
          }

          <span class="node__icon" [class]="'node__icon--' + typeClass()">
            <i [class]="typeIcon()" aria-hidden="true"></i>
          </span>

          <span class="node__label u-truncate">{{ node().organization.name }}</span>

          @if (node().organization.tenantCount > 0) {
            <span class="node__count" [attr.title]="node().organization.tenantCount + ' tenants'">
              {{ node().organization.tenantCount }}
            </span>
          }

          @if (node().organization.status !== 'Active') {
            <span class="node__flag" [attr.title]="node().organization.status">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            </span>
          }
        </div>

        @if (isExpanded() || searchTerm()) {
          <div class="node__children" role="group">
            @for (child of node().children; track child.organization.id) {
              <ctv-org-tree-node
                [node]="child"
                [selectedId]="selectedId()"
                [expandedIds]="expandedIds()"
                [searchTerm]="searchTerm()"
                (select)="select.emit($event)"
                (toggle)="toggle.emit($event)"
              />
            }
          </div>
        }
      </div>
    }
  `,
  styleUrl: './org-tree-node.component.scss',
})
export class OrgTreeNodeComponent {
  readonly node = input.required<OrganizationNode>();
  readonly selectedId = input<string | null>(null);
  readonly expandedIds = input<ReadonlySet<string>>(new Set<string>());
  readonly searchTerm = input('');

  readonly select = output<TreeNodeEvent>();
  readonly toggle = output<TreeNodeEvent>();

  readonly hasChildren = computed(() => this.node().children.length > 0);
  readonly isExpanded = computed(() => this.expandedIds().has(this.node().organization.id));

  /** A node stays visible when it, or anything beneath it, matches the search. */
  readonly visible = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return true;
    }
    return this.matches(this.node(), term);
  });

  readonly typeIcon = computed(() => {
    switch (this.node().organization.type) {
      case 'Platform':
        return 'pi pi-globe';
      case 'Vendor':
        return 'pi pi-box';
      case 'Partner':
        return 'pi pi-share-alt';
      case 'Reseller':
        return 'pi pi-briefcase';
      case 'Region':
        return 'pi pi-map-marker';
      case 'Division':
        return 'pi pi-th-large';
      default:
        return 'pi pi-building';
    }
  });

  readonly typeClass = computed(() => this.node().organization.type.toLowerCase());

  private matches(node: OrganizationNode, term: string): boolean {
    const organization = node.organization;
    const own = `${organization.name} ${organization.key} ${organization.type} ${organization.ownerName}`.toLowerCase();
    if (own.includes(term)) {
      return true;
    }
    return node.children.some((child) => this.matches(child, term));
  }
}
