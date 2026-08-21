import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { avatarColorFor, initialsFor } from '../status.util';

@Component({
  selector: 'ctv-entity-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="fontSize()"
      [style.background]="background()"
      [style.border-radius]="rounded() ? '50%' : null"
      [attr.aria-label]="name()"
      role="img"
    >
      @if (icon()) {
        <i [class]="icon()" aria-hidden="true"></i>
      } @else {
        {{ initials() }}
      }
    </span>
  `,
})
export class EntityAvatarComponent {
  readonly name = input.required<string>();
  readonly size = input(32);
  readonly color = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly rounded = input(false);

  readonly initials = computed(() => initialsFor(this.name()));
  readonly background = computed(() => this.color() ?? avatarColorFor(this.name()));
  readonly fontSize = computed(() => Math.max(10, Math.round(this.size() * 0.38)));
}
