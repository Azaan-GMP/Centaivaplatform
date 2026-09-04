import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { PlatformBootstrapService } from '../../../../services/platform-bootstrap.service';
import { ThemeService } from '../../../../services/theme.service';
import { IconComponent } from '../../../../shared/UI/icon/icon.component';
import { environment } from '../../../../environments/environment';

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isProfileDropdownOpen = false;
  isNotificationsOpen = false;
  searchQuery = '';

  readonly appName = environment.appName;
  readonly isProd = environment.production;

  notifications = signal<HeaderNotification[]>([
    {
      id: '1',
      title: 'Tenant Isolation Active',
      description: 'Eutopia Search & Patrick Morgan mapped to CompIds 1 & 2',
      time: '2m ago',
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'Platform OAuth 2.0 Synced',
      description: 'Central OAuth Authority responded in 12ms',
      time: '15m ago',
      type: 'info',
      read: false
    },
    {
      id: '3',
      title: 'RBAC Policy Enforced',
      description: 'Platform Owner session initialized with zero-trust scope',
      time: '1h ago',
      type: 'info',
      read: true
    }
  ]);

  constructor(
    public authService: AuthService,
    public bootstrapService: PlatformBootstrapService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isNotificationsOpen = false;
    }
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  logout(): void {
    this.isProfileDropdownOpen = false;
    this.authService.logout();
  }

  navigateTo(path: string): void {
    this.isProfileDropdownOpen = false;
    this.isNotificationsOpen = false;
    this.router.navigate([path]);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedProfile = target.closest('.profile-dropdown-wrapper');
    const clickedNotifications = target.closest('.notifications-dropdown-wrapper');

    if (!clickedProfile) {
      this.isProfileDropdownOpen = false;
    }
    if (!clickedNotifications) {
      this.isNotificationsOpen = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      const searchInput = document.getElementById('global-command-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }
}
