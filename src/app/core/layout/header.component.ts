import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Crumb } from '../../shared/components/breadcrumb.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb.component';
import { LayoutService } from '../services/layout.service';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';
import { QUICK_ACTIONS, ROUTE_TITLES } from './navigation';

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
  icon: string;
}

@Component({
  selector: 'ctv-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, MenuModule, PopoverModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly layout = inject(LayoutService);
  private readonly notifications = inject(NotificationService);
  readonly session = inject(SessionService);

  @ViewChild('profileMenu') profileMenu!: Menu;
  @ViewChild('createPanel') createPanel!: Popover;
  @ViewChild('notificationPanel') notificationPanel!: Popover;

  readonly quickActions = QUICK_ACTIONS;
  readonly searchTerm = signal('');
  readonly searchFocused = signal(false);
  readonly darkMode = this.layout.darkMode;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly match = computed(() => {
    const current = this.url().split('?')[0] ?? '';
    return ROUTE_TITLES.find((entry) => current === entry.prefix || current.startsWith(`${entry.prefix}/`));
  });

  readonly pageTitle = computed(() => this.match()?.title ?? 'Centaiva Platform');

  readonly crumbs = computed<Crumb[]>(() => {
    const match = this.match();
    const crumbs: Crumb[] = [{ label: 'Centaiva', link: '/app/overview' }];
    if (match?.parent) {
      crumbs.push({ label: match.parent.label, link: match.parent.route });
    }
    if (match) {
      const isDetail = (this.url().split('?')[0] ?? '').length > match.prefix.length;
      crumbs.push(isDetail ? { label: match.title, link: match.prefix } : { label: match.title });
      if (isDetail) {
        crumbs.push({ label: 'Detail' });
      }
    }
    return crumbs;
  });

  readonly notificationItems: NotificationItem[] = [
    { id: 'n1', title: 'Provisioning run failed', detail: 'RUN-9165 · Data store capacity threshold exceeded', time: '6 min ago', tone: 'danger', icon: 'pi pi-times-circle' },
    { id: 'n2', title: 'Identity provider error', detail: 'Helix Inc Entra ID returned invalid_client', time: '38 min ago', tone: 'warning', icon: 'pi pi-exclamation-triangle' },
    { id: 'n3', title: 'Licence seats nearly exhausted', detail: 'Alpha Group Production is at 94% of 180 seats', time: '2 h ago', tone: 'warning', icon: 'pi pi-id-card' },
    { id: 'n4', title: 'New tenant provisioned', detail: 'Delta Field Services is now active in UK South', time: '5 h ago', tone: 'success', icon: 'pi pi-check-circle' },
    { id: 'n5', title: 'Plan version published', detail: 'WorkWell Finance Business 2.0 is now live', time: 'Yesterday', tone: 'info', icon: 'pi pi-tags' },
  ];

  readonly profileMenuItems: MenuItem[] = [
    { label: 'My Account', icon: 'pi pi-user', command: () => this.notImplemented('My Account') },
    { label: 'Security', icon: 'pi pi-shield', command: () => void this.router.navigate(['/app/security']) },
    { label: 'Change Password', icon: 'pi pi-lock', command: () => this.notImplemented('Change Password') },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', styleClass: 'menu-item-danger', command: () => this.signOut() },
  ];

  readonly searchResults = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return [];
    }
    const catalogue = [
      { label: 'Users', route: '/app/users', icon: 'pi pi-users', group: 'Identity' },
      { label: 'Organizations', route: '/app/organizations', icon: 'pi pi-sitemap', group: 'Identity' },
      { label: 'Tenants', route: '/app/tenants', icon: 'pi pi-building', group: 'Identity' },
      { label: 'Roles & Permissions', route: '/app/access/roles', icon: 'pi pi-shield', group: 'Identity' },
      { label: 'Products', route: '/app/products', icon: 'pi pi-box', group: 'Catalog' },
      { label: 'Applications', route: '/app/applications', icon: 'pi pi-desktop', group: 'Catalog' },
      { label: 'Plans', route: '/app/plans', icon: 'pi pi-tags', group: 'Catalog' },
      { label: 'Entitlements', route: '/app/entitlements', icon: 'pi pi-unlock', group: 'Catalog' },
      { label: 'Subscriptions', route: '/app/subscriptions', icon: 'pi pi-credit-card', group: 'Commercial' },
      { label: 'Licenses', route: '/app/licenses', icon: 'pi pi-id-card', group: 'Commercial' },
      { label: 'License Pools', route: '/app/license-pools', icon: 'pi pi-share-alt', group: 'Commercial' },
      { label: 'Usage & Quotas', route: '/app/usage', icon: 'pi pi-chart-bar', group: 'Commercial' },
      { label: 'Provisioning', route: '/app/provisioning', icon: 'pi pi-bolt', group: 'Operations' },
      { label: 'Deployments', route: '/app/deployments', icon: 'pi pi-server', group: 'Operations' },
      { label: 'Data Stores', route: '/app/data-stores', icon: 'pi pi-database', group: 'Operations' },
      { label: 'Integrations', route: '/app/integrations', icon: 'pi pi-link', group: 'Operations' },
      { label: 'Audit Logs', route: '/app/audit', icon: 'pi pi-history', group: 'System' },
      { label: 'Diagnostics', route: '/app/system/diagnostics', icon: 'pi pi-heart', group: 'System' },
      { label: 'Feature Flags', route: '/app/feature-flags', icon: 'pi pi-flag', group: 'Security' },
      { label: 'Identity Providers', route: '/app/security/identity-providers', icon: 'pi pi-key', group: 'Security' },
    ];

    return catalogue.filter((entry) => entry.label.toLowerCase().includes(term) || entry.group.toLowerCase().includes(term)).slice(0, 6);
  });

  toggleSidebar(): void {
    this.layout.toggleSidebar();
  }

  openMobileNav(): void {
    this.layout.openMobileNav();
  }

  toggleDarkMode(): void {
    this.layout.toggleDarkMode();
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  goTo(route: string): void {
    this.searchTerm.set('');
    this.searchFocused.set(false);
    void this.router.navigate([route]);
  }

  runQuickAction(route: string, label: string): void {
    this.createPanel?.hide();
    void this.router.navigate([route], { queryParams: { create: 1 } });
    this.notifications.info(label, 'Opened the creation flow for this resource.');
  }

  notImplemented(label: string): void {
    this.notifications.info(label, 'This screen is part of the upcoming API integration phase.');
  }

  signOut(): void {
    this.session.signOut();
    void this.router.navigate(['/login']);
  }

  dismissNotifications(): void {
    this.notificationPanel?.hide();
    this.notifications.success('Notifications cleared', 'All platform alerts marked as read.');
  }
}
