import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ctv-loading-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack" [style.gap.px]="gap()" aria-busy="true" aria-live="polite">
      @for (line of lines(); track line) {
        <div
          class="skeleton"
          [style.height.px]="height()"
          [style.width]="line === rowCount() - 1 ? lastWidth() : '100%'"
        ></div>
      }
      <span class="u-sr-only">Loading</span>
    </div>
  `,
  styles: [
    `
      .stack { display: flex; flex-direction: column; }
    `,
  ],
})
export class LoadingSkeletonComponent {
  readonly rowCount = input(3);
  readonly height = input(12);
  readonly gap = input(10);
  readonly lastWidth = input('62%');

  readonly lines = computed(() => Array.from({ length: this.rowCount() }, (_, index) => index));
}
