import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { LayoutService } from '../services/layout.service';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'ctv-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, DrawerModule],
  template: `
    <div class="shell" [class.shell--collapsed]="layout.sidebarCollapsed()">
      <div class="shell__sidebar">
        <ctv-sidebar />
      </div>

      <div class="shell__main">
        <ctv-header />
        <main class="shell__content" id="main-content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>

    <p-drawer
      [visible]="layout.mobileNavOpen()"
      (visibleChange)="onMobileNavVisibility($event)"
      position="left"
      [style]="{ width: '272px' }"
      [showCloseIcon]="false"
      styleClass="ctv-mobile-nav"
    >
      <ctv-sidebar />
    </p-drawer>
  `,
  styles: [
    `
      :host { display: block; height: 100vh; }

      .shell {
        display: grid;
        grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
        height: 100vh;
        transition: grid-template-columns 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .shell--collapsed { grid-template-columns: var(--sidebar-collapsed-width) minmax(0, 1fr); }

      .shell__sidebar { height: 100vh; position: sticky; top: 0; z-index: var(--z-sidebar); }

      .shell__main {
        display: flex;
        flex-direction: column;
        min-width: 0;
        height: 100vh;
      }

      .shell__main ctv-header {
        position: sticky;
        top: 0;
        z-index: var(--z-header);
      }

      .shell__content {
        flex: 1 1 auto;
        overflow-y: auto;
        background: var(--surface-page);
        outline: none;
      }

      @media (max-width: 1024px) {
        .shell { grid-template-columns: minmax(0, 1fr); }
        .shell__sidebar { display: none; }
      }
    `,
  ],
})
export class AppShellComponent {
  readonly layout = inject(LayoutService);

  onMobileNavVisibility(visible: boolean): void {
    if (!visible) {
      this.layout.closeMobileNav();
    }
  }
}
