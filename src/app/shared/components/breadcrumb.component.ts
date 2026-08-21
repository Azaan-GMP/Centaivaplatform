import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  link?: string | unknown[];
}

@Component({
  selector: 'ctv-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        @for (crumb of items(); track crumb.label; let last = $last) {
          <li>
            @if (crumb.link && !last) {
              <a [routerLink]="crumb.link">{{ crumb.label }}</a>
            } @else {
              <span [attr.aria-current]="last ? 'page' : null">{{ crumb.label }}</span>
            }
            @if (!last) {
              <i class="pi pi-angle-right" aria-hidden="true"></i>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      .crumbs ol {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
      }
      li {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: var(--fs-sm);
        color: var(--text-secondary);
      }
      a {
        color: var(--text-secondary);
        padding: 1px 4px;
        border-radius: var(--radius-xs);
      }
      a:hover {
        color: var(--color-primary);
        background: var(--surface-hover);
        text-decoration: none;
      }
      span[aria-current] {
        color: var(--text-primary);
        font-weight: 500;
        padding: 1px 4px;
      }
      i {
        font-size: 9px;
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class BreadcrumbComponent {
  readonly items = input.required<Crumb[]>();
}
