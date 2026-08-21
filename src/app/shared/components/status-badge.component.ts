import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Severity } from '../../core/models';
import { severityForStatus } from '../status.util';

@Component({
  selector: 'ctv-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="'badge--' + resolvedSeverity()" [attr.title]="title() || status()">
      @if (dot()) {
        <span class="badge__dot" aria-hidden="true"></span>
      }
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly severity = input<Severity | null>(null);
  readonly dot = input(true);
  readonly title = input<string | null>(null);

  readonly resolvedSeverity = computed(() => this.severity() ?? severityForStatus(this.status()));
}
