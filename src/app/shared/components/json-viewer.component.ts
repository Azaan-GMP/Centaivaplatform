import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

interface JsonLine {
  indent: number;
  key: string | null;
  value: string | null;
  kind: 'string' | 'number' | 'boolean' | 'null' | 'brace';
  trailingComma: boolean;
}

/** Read-only formatted JSON, used for audit before/after and metadata payloads. */
@Component({
  selector: 'ctv-json-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="json">
      <div class="json__bar">
        <span class="json__title">{{ label() }}</span>
        <button type="button" class="btn btn--ghost btn--sm" (click)="copy()">
          <i class="pi" [class.pi-copy]="!copied()" [class.pi-check]="copied()" aria-hidden="true"></i>
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </div>

      @if (isEmpty()) {
        <p class="json__empty">No data recorded for this field.</p>
      } @else {
        <pre class="json__body"><code>@for (line of lines(); track $index) {<span class="json__line"><span [style.padding-left.px]="line.indent * 14"></span>@if (line.key) {<span class="json__key">"{{ line.key }}"</span><span class="json__punct">: </span>}@if (line.value !== null) {<span [class]="'json__' + line.kind">{{ line.value }}</span>}@if (line.trailingComma) {<span class="json__punct">,</span>}
</span>}</code></pre>
      }
    </div>
  `,
  styles: [
    `
      .json {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--surface-sunken);
        overflow: hidden;
      }
      .json__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: 5px 6px 5px 12px;
        border-bottom: 1px solid var(--border-default);
        background: var(--surface-card);
      }
      .json__title {
        font-size: var(--fs-xs);
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-tertiary);
      }
      .json__body {
        margin: 0;
        padding: var(--space-3) var(--space-4);
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        line-height: 1.7;
        overflow-x: auto;
        max-height: 340px;
      }
      .json__line { display: block; white-space: pre; }
      .json__key { color: #1553b0; }
      .json__string { color: #0f766e; }
      .json__number { color: #b45309; }
      .json__boolean { color: #6027d0; }
      .json__null { color: var(--text-tertiary); }
      .json__brace { color: var(--text-secondary); }
      .json__punct { color: var(--text-tertiary); }
      .json__empty {
        padding: var(--space-4);
        font-size: var(--fs-sm);
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class JsonViewerComponent {
  readonly data = input<Record<string, unknown> | null>(null);
  readonly label = input('JSON');

  readonly copied = signal(false);

  readonly isEmpty = computed(() => {
    const data = this.data();
    return !data || Object.keys(data).length === 0;
  });

  readonly lines = computed<JsonLine[]>(() => {
    const data = this.data();
    if (!data) return [];
    const output: JsonLine[] = [];
    output.push({ indent: 0, key: null, value: '{', kind: 'brace', trailingComma: false });
    this.walk(data, 1, output);
    output.push({ indent: 0, key: null, value: '}', kind: 'brace', trailingComma: false });
    return output;
  });

  copy(): void {
    const text = JSON.stringify(this.data() ?? {}, null, 2);
    void navigator.clipboard?.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }

  private walk(value: Record<string, unknown>, indent: number, output: JsonLine[]): void {
    const entries = Object.entries(value);

    entries.forEach(([key, entry], index) => {
      const isLast = index === entries.length - 1;

      if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
        output.push({ indent, key, value: '{', kind: 'brace', trailingComma: false });
        this.walk(entry as Record<string, unknown>, indent + 1, output);
        output.push({ indent, key: null, value: '}', kind: 'brace', trailingComma: !isLast });
        return;
      }

      output.push({
        indent,
        key,
        value: this.render(entry),
        kind: this.kindOf(entry),
        trailingComma: !isLast,
      });
    });
  }

  private render(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  }

  private kindOf(value: unknown): JsonLine['kind'] {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  }
}
