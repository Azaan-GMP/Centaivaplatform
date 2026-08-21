import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { LayoutService } from '../services/layout.service';
import { NAVIGATION, NavItem } from './navigation';

@Component({
  selector: 'ctv-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly layout = inject(LayoutService);

  readonly groups = NAVIGATION;
  readonly collapsed = this.layout.sidebarCollapsed;
  readonly contextOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly activeRoute = computed(() => this.url());

  isActive(item: NavItem): boolean {
    const current = this.activeRoute();
    if (item.prefixMatch) {
      return current === item.route || current.startsWith(`${item.route}/`);
    }
    return current === item.route || current.startsWith(`${item.route}?`);
  }

  onNavigate(): void {
    this.layout.closeMobileNav();
  }

  toggleContext(): void {
    this.contextOpen.update((open) => !open);
  }
}
