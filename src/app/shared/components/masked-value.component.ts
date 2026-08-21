import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Secrets are never held in the client. This renders the masked placeholder the
 * API returns and offers a copy affordance for the reference only.
 */
@Component({
  selector: 'ctv-masked-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="masked" [attr.title]="hint()">
      @if (icon()) {
        <i [class]="icon()" aria-hidden="true"></i>
      }
      {{ value() }}
      @if (copyable()) {
        <button type="button" class="masked__btn" [attr.aria-label]="'Copy ' + label()" (click)="copy($event)">
          <i class="pi" [class.pi-copy]="!copied()" [class.pi-check]="copied()" aria-hidden="true"></i>
        </button>
      }
    </span>
  `,
  styles: [
    `
      .masked__btn {
        border: 0;
        background: transparent;
        color: var(--text-tertiary);
        cursor: pointer;
        padding: 0 0 0 2px;
        font-size: 10px;
        line-height: 1;
      }
      .masked__btn:hover { color: var(--color-primary); }
    `,
  ],
})
export class MaskedValueComponent {
  readonly value = input.required<string>();
  readonly label = input('value');
  readonly icon = input<string | null>(null);
  readonly copyable = input(true);
  readonly hint = input('Masked for security — the full value is never exposed to the console.');

  readonly copied = signal(false);

  copy(event: Event): void {
    event.stopPropagation();
    void navigator.clipboard?.writeText(this.value());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
