import { Injectable, signal } from '@angular/core';

/** Shell chrome state shared between the sidebar, header and page content. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarCollapsed = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly searchOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  openMobileNav(): void {
    this.mobileNavOpen.set(true);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  toggleSearch(): void {
    this.searchOpen.update((open) => !open);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }
}
