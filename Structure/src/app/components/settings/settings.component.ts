import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeService, AppTheme, AccentColor, ContentDensity } from '../../../services/theme.service';
import { PlatformApiService } from '../../../services/platform-api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  activeTab = signal<'appearance' | 'platform' | 'notifications' | 'security'>('appearance');

  // Form states
  notificationsEmail = signal<boolean>(true);
  notificationsBrowser = signal<boolean>(true);
  notificationsSecurityAlerts = signal<boolean>(true);
  autoSaveFilters = signal<boolean>(true);
  sessionAutoLockMinutes = signal<number>(30);
  enableAuditLogging = signal<boolean>(true);

  readonly appEnv = environment;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('centaiva_notif_email');
    if (savedEmail !== null) this.notificationsEmail.set(savedEmail === 'true');

    const savedBrowser = localStorage.getItem('centaiva_notif_browser');
    if (savedBrowser !== null) this.notificationsBrowser.set(savedBrowser === 'true');

    const savedSec = localStorage.getItem('centaiva_notif_security');
    if (savedSec !== null) this.notificationsSecurityAlerts.set(savedSec === 'true');
  }

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
    const label = theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'System Sync';
    this.toastr.success(`Theme mode updated to ${label}`);
  }

  setAccent(accent: AccentColor): void {
    this.themeService.setAccentColor(accent);
    this.toastr.info(`Brand accent updated to ${accent.toUpperCase()}`);
  }

  setDensity(density: ContentDensity): void {
    this.themeService.setContentDensity(density);
    this.toastr.info(`Display density set to ${density}`);
  }

  resetToDefaults(): void {
    this.themeService.setTheme('dark');
    this.themeService.setAccentColor('cyan');
    this.themeService.setContentDensity('comfortable');
    this.notificationsEmail.set(true);
    this.notificationsBrowser.set(true);
    this.notificationsSecurityAlerts.set(true);
    this.saveNotificationPreferences();
    this.toastr.success('Preferences reset to platform defaults');
  }

  copyApiUrl(url: string, label: string): void {
    navigator.clipboard?.writeText(url);
    this.toastr.success(`Copied ${label}: ${url}`);
  }

  saveNotificationPreferences(): void {
    localStorage.setItem('centaiva_notif_email', String(this.notificationsEmail()));
    localStorage.setItem('centaiva_notif_browser', String(this.notificationsBrowser()));
    localStorage.setItem('centaiva_notif_security', String(this.notificationsSecurityAlerts()));
    this.toastr.success('Notification preferences saved successfully');
  }

  clearLocalCaches(): void {
    const theme = localStorage.getItem('centaiva_theme_mode');
    const auth = localStorage.getItem('centaiva_token_data');
    localStorage.clear();
    if (theme) localStorage.setItem('centaiva_theme_mode', theme);
    if (auth) localStorage.setItem('centaiva_token_data', auth);
    this.toastr.success('Client storage & caches purged successfully');
  }
}
