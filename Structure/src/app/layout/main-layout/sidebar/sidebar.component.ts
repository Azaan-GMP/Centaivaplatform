import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../../../shared/UI/icon/icon.component';
import { PlatformBootstrapService } from '../../../../services/platform-bootstrap.service';
import { AuthService } from '../../../../services/auth.service';

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  route?: string;
  icon: string;
  badge?: string;
  badgeType?: 'primary' | 'cyan' | 'amber';
  requiredPermission?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isCollapsed = signal<boolean>(false);
  expandedMenus = signal<Record<string, boolean>>({
    'Settings': true
  });

  readonly navSections: NavSection[] = [
    {
      title: 'PLATFORM',
      items: [
        { label: 'Overview', route: '/dashboard', icon: 'dashboard' }
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { label: 'Organizations', route: '/organizations', icon: 'building' },
        { label: 'Tenants', route: '/tenants', icon: 'tenants' },
        { label: 'Users', route: '/users', icon: 'user' }
      ]
    },
    {
      title: 'APPS & OPERATIONS',
      items: [
        { label: 'Products', route: '/products', icon: 'layers' },
        { label: 'Applications', route: '/applications', icon: 'code' },
        { label: 'Integrations', route: '/integrations', icon: 'refresh' },
        { label: 'Audit Logs', route: '/audit', icon: 'reports' }
      ]
    },
    {
      title: 'ONBOARDING',
      items: [
        { label: 'Platform Onboarding', route: '/onboarding', icon: 'plusIcon' }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        {
          label: 'Settings',
          icon: 'settings',
          badge: 'NEW',
          badgeType: 'cyan',
          children: [
            { label: 'Roles', route: '/roles', icon: 'shield' },
            { label: 'Permissions', route: '/permissions', icon: 'lock' }
          ]
        }
      ]
    }
  ];

  constructor(
    private router: Router,
    public bootstrapService: PlatformBootstrapService,
    public authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.autoExpandMenusByRoute());
  }

  ngOnInit(): void {
    const savedSidebar = localStorage.getItem('sidebar-collapsed');
    if (savedSidebar !== null) {
      this.isCollapsed.set(savedSidebar === 'true');
    }
    this.autoExpandMenusByRoute();
  }

  toggleSidebar(): void {
    const next = !this.isCollapsed();
    this.isCollapsed.set(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  toggleMenu(label: string): void {
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
    }
    const current = this.expandedMenus();
    this.expandedMenus.set({
      ...current,
      [label]: !current[label]
    });
  }

  isMenuExpanded(label: string): boolean {
    return !!this.expandedMenus()[label];
  }

  hasChildren(item: NavItem): boolean {
    return !!item.children && item.children.length > 0;
  }

  isChildRouteActive(item: NavItem): boolean {
    return !!item.children?.some(child =>
      child.route && this.router.url.startsWith(child.route)
    );
  }

  private autoExpandMenusByRoute(): void {
    const current = { ...this.expandedMenus() };
    this.navSections.forEach(section => {
      section.items.forEach(item => {
        if (this.hasChildren(item) && this.isChildRouteActive(item)) {
          current[item.label] = true;
        }
      });
    });
    this.expandedMenus.set(current);
  }
}
