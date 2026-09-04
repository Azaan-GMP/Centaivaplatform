import { Component, Input, forwardRef, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group relative select-none" [class.opacity-60]="disabled">
      <label class="block text-xs font-semibold text-slate-300 mb-1" *ngIf="label">
        {{ label }}
        <span class="text-rose-400" *ngIf="required">*</span>
      </label>

      <!-- Trigger -->
      <button
        type="button"
        (click)="toggleOpen($event)"
        [disabled]="disabled"
        class="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 bg-[#050a16] border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs text-slate-100 font-medium transition-all shadow-md focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
        [class.border-rose-500]="control?.invalid && control?.touched"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <svg
          class="w-3.5 h-3.5 text-cyan-400 shrink-0 transition-transform duration-200"
          [class.rotate-180]="isOpen"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Floating Options Menu -->
      <div
        *ngIf="isOpen"
        class="absolute left-0 right-0 mt-2 z-50 rounded-xl bg-[#060b1a]/98 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(0,210,255,0.12)] p-1.5 space-y-1 max-h-56 overflow-y-auto animate-dropdownFade"
      >
        <div
          *ngFor="let option of options"
          (click)="selectOption(option, $event)"
          class="px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
          [ngClass]="isSelected(option) ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
        >
          <span class="truncate">{{ getOptionLabel(option) }}</span>
          <svg
            *ngIf="isSelected(option)"
            class="w-3.5 h-3.5 text-cyan-400 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>

      <p class="text-[10px] text-slate-400 mt-1" *ngIf="helpText">{{ helpText }}</p>
      <div class="text-[10px] text-rose-400 mt-1" *ngIf="errorMessage && control?.invalid && control?.touched">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    @keyframes dropdownFade {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-dropdownFade {
      animation: dropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class FormSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() required = false;
  @Input() multiple = false;
  @Input() control: FormControl | null = null;
  @Input() errorMessage = '';
  @Input() helpText = '';
  @Input() options: any[] = [];

  value: any = '';
  disabled = false;
  isOpen = false;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  get selectedLabel(): string {
    if (!this.value && this.value !== 0) {
      return this.placeholder;
    }
    const found = this.options.find(o => (o.id !== undefined ? o.id === this.value : o.value === this.value || o === this.value));
    return found ? this.getOptionLabel(found) : this.placeholder;
  }

  getOptionLabel(option: any): string {
    if (typeof option === 'string' || typeof option === 'number') return String(option);
    return option.name || option.label || option.displayName || String(option.id || option.value);
  }

  getOptionValue(option: any): any {
    if (typeof option === 'string' || typeof option === 'number') return option;
    return option.id !== undefined ? option.id : option.value;
  }

  isSelected(option: any): boolean {
    const optVal = this.getOptionValue(option);
    return this.value === optVal;
  }

  toggleOpen(e: Event): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectOption(option: any, e: Event): void {
    e.stopPropagation();
    const val = this.getOptionValue(option);
    this.value = val;
    this.onChange(val);
    this.onTouched();
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  writeValue(val: any): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
