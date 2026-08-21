import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'ctv-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search" [style.width.px]="width() || null">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input
        type="search"
        class="input"
        [attr.aria-label]="placeholder()"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
      />
      @if (value()) {
        <button type="button" class="search__clear" aria-label="Clear search" (click)="value.set('')">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .search { position: relative; display: flex; align-items: center; }
      .pi-search {
        position: absolute;
        left: 10px;
        font-size: 12px;
        color: var(--text-tertiary);
        pointer-events: none;
      }
      .input { padding-left: 30px; padding-right: 28px; height: 34px; }
      .input::-webkit-search-cancel-button { display: none; }
      .search__clear {
        position: absolute;
        right: 6px;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: var(--radius-xs);
        background: transparent;
        color: var(--text-tertiary);
        cursor: pointer;
        font-size: 10px;
      }
      .search__clear:hover { background: var(--surface-hover); color: var(--text-primary); }
    `,
  ],
})
export class SearchInputComponent {
  readonly value = model('');
  readonly placeholder = input('Search');
  readonly width = input(260);

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
