import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

/** Reusable confirmation for destructive or state-changing actions. */
@Component({
  selector: 'ctv-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [dismissableMask]="true"
      [style]="{ width: '440px' }"
      [header]="title()"
    >
      <div class="confirm">
        <span class="confirm__icon" [class]="'confirm__icon--' + tone()">
          <i [class]="icon()" aria-hidden="true"></i>
        </span>
        <div class="confirm__text">
          <p class="confirm__message">{{ message() }}</p>
          @if (detail()) {
            <p class="confirm__detail">{{ detail() }}</p>
          }
        </div>
      </div>

      <ng-template #footer>
        <button type="button" class="btn" (click)="cancel()">{{ cancelLabel() }}</button>
        <button
          type="button"
          class="btn"
          [class.btn--danger]="tone() === 'danger'"
          [class.btn--primary]="tone() !== 'danger'"
          (click)="accept()"
        >
          {{ confirmLabel() }}
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .confirm { display: flex; gap: var(--space-4); align-items: flex-start; }
      .confirm__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        flex: none;
        font-size: 15px;
      }
      .confirm__icon--danger { background: var(--color-danger-soft); color: #b91c1c; }
      .confirm__icon--warning { background: var(--color-warning-soft); color: #a26205; }
      .confirm__icon--primary { background: var(--color-primary-soft); color: #1553b0; }
      .confirm__text { display: flex; flex-direction: column; gap: 4px; }
      .confirm__message { font-size: var(--fs-md); color: var(--text-primary); }
      .confirm__detail { font-size: var(--fs-base); color: var(--text-secondary); }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly visible = model(false);
  readonly title = input('Are you sure?');
  readonly message = input('This action will change platform state.');
  readonly detail = input<string | null>(null);
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<'danger' | 'warning' | 'primary'>('danger');
  readonly icon = input('pi pi-exclamation-triangle');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  accept(): void {
    this.visible.set(false);
    this.confirmed.emit();
  }

  cancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }
}
