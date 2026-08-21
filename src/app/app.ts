import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastModule],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <router-outlet />
    <p-toast position="bottom-right" />
  `,
  styles: [
    `
      .skip-link {
        position: absolute;
        left: -9999px;
        top: 8px;
        z-index: 9999;
        background: var(--surface-card);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-sm);
        padding: 8px 14px;
        font-weight: 600;
      }
      .skip-link:focus {
        left: 12px;
      }
    `,
  ],
})
export class App {}
