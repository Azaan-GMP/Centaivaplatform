import { Injectable, signal, computed, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light' | 'system';
export type AccentColor = 'cyan' | 'blue' | 'emerald' | 'purple' | 'amber';
export type ContentDensity = 'comfortable' | 'compact';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'centaiva_theme_mode';
  private readonly ACCENT_KEY = 'centaiva_accent_color';
  private readonly DENSITY_KEY = 'centaiva_content_density';

  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly accentColor = signal<AccentColor>(this.getInitialAccent());
  readonly contentDensity = signal<ContentDensity>(this.getInitialDensity());

  readonly isDarkMode = computed(() => {
    const current = this.theme();
    if (current === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return current === 'dark';
  });

  constructor() {
    // Reactively update HTML tag attributes when signals change
    effect(() => {
      const isDark = this.isDarkMode();
      const themeVal = this.theme();
      const accent = this.accentColor();
      const density = this.contentDensity();

      const root = document.documentElement;

      // Toggle dark class for Tailwind
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light', 'theme-light');
        root.classList.add('theme-dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark', 'theme-dark');
        root.classList.add('light', 'theme-light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }

      // Accent color attribute
      root.setAttribute('data-accent', accent);
      root.setAttribute('data-density', density);

      // Save to localStorage
      localStorage.setItem(this.THEME_KEY, themeVal);
      localStorage.setItem(this.ACCENT_KEY, accent);
      localStorage.setItem(this.DENSITY_KEY, density);
    });

    // Listen for system theme changes if user chose 'system'
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.theme.set('system'); // trigger recompute
        }
      });
    }
  }

  setTheme(newTheme: AppTheme): void {
    this.theme.set(newTheme);
  }

  toggleTheme(): void {
    const isDark = this.isDarkMode();
    this.theme.set(isDark ? 'light' : 'dark');
  }

  setAccentColor(color: AccentColor): void {
    this.accentColor.set(color);
  }

  setContentDensity(density: ContentDensity): void {
    this.contentDensity.set(density);
  }

  private getInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.THEME_KEY) as AppTheme;
    if (saved && ['dark', 'light', 'system'].includes(saved)) {
      return saved;
    }
    return 'dark'; // Default premium dark
  }

  private getInitialAccent(): AccentColor {
    const saved = localStorage.getItem(this.ACCENT_KEY) as AccentColor;
    if (saved && ['cyan', 'blue', 'emerald', 'purple', 'amber'].includes(saved)) {
      return saved;
    }
    return 'cyan';
  }

  private getInitialDensity(): ContentDensity {
    const saved = localStorage.getItem(this.DENSITY_KEY) as ContentDensity;
    if (saved && ['comfortable', 'compact'].includes(saved)) {
      return saved;
    }
    return 'comfortable';
  }
}
