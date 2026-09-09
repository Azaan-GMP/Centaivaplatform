import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'centaiva-theme';

/** Shell chrome state shared between the sidebar, header and page content. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly document = inject(DOCUMENT);
  readonly sidebarCollapsed = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly darkMode = signal(false);

  constructor() {
    const window = this.document.defaultView;
    const savedTheme = window?.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    this.setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark, false);
  }

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

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkMode());
  }

  private setDarkMode(enabled: boolean, persist = true): void {
    this.darkMode.set(enabled);
    this.document.documentElement.classList.toggle('ctv-dark', enabled);
    this.document.documentElement.style.colorScheme = enabled ? 'dark' : 'light';

    if (persist) {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light');
    }
  }
}
