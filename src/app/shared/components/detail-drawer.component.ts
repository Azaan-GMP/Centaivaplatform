import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';

/** Right-hand inspector used for audit events, configuration and record detail. */
@Component({
  selector: 'ctv-detail-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrawerModule],
  template: `
    <p-drawer
      [(visible)]="visible"
      position="right"
      [style]="{ width: width() }"
      [showCloseIcon]="false"
      [blockScroll]="true"
      styleClass="ctv-drawer"
    >
      <ng-template #header>
        <div class="drawer-head">
          <div class="drawer-head__text">
            @if (eyebrow()) {
              <span class="eyebrow">{{ eyebrow() }}</span>
            }
            <h2 class="drawer-head__title">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="drawer-head__subtitle">{{ subtitle() }}</p>
            }
          </div>
          <button type="button" class="btn btn--ghost btn--icon btn--sm" aria-label="Close" (click)="visible.set(false)">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </ng-template>

      <div class="drawer-body">
        <ng-content />
      </div>

      <ng-content select="[slot=footer]" />
    </p-drawer>
  `,
  styles: [
    `
      .drawer-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
        width: 100%;
      }
      .drawer-head__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .drawer-head__title { font-size: var(--fs-lg); font-weight: 650; letter-spacing: -0.015em; }
      .drawer-head__subtitle { font-size: var(--fs-sm); color: var(--text-secondary); }
      .drawer-body {
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }
    `,
  ],
})
export class DetailDrawerComponent {
  readonly visible = model(false);
  readonly title = input('Details');
  readonly subtitle = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
  readonly width = input('520px');
}
