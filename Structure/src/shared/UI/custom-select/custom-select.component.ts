import { Component, Input, Output, EventEmitter, ElementRef, HostListener, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface SelectOption {
  value: any;
  label: string;
  badge?: string;
  icon?: string;
}

// Global coordinator to ensure only one dropdown is open at a time
let activeDropdown: CustomSelectComponent | null = null;

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative inline-block text-left select-none w-full" [class.z-[99999]]="isOpen" [class.opacity-60]="disabled">
      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleOpen($event)"
        [disabled]="disabled"
        class="custom-select-trigger w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#16161a] border border-[#2a2a32] hover:border-[#00D4FF]/60 hover:bg-[#1a1a20] rounded-xl text-xs text-white transition-all shadow-sm focus:outline-none cursor-pointer select-none"
        [ngClass]="isOpen ? 'border-[#00D4FF] ring-2 ring-[#00D4FF]/25 bg-[#1a1a22]' : ''"
      >
        <div class="flex items-center gap-2 truncate">
          <span [ngClass]="value ? 'text-white font-semibold' : 'text-slate-400 font-normal'" class="truncate">
            {{ selectedLabel }}
          </span>
        </div>

        <svg
          class="w-4 h-4 text-[#00D4FF] shrink-0 transition-transform duration-200"
          [class.rotate-180]="isOpen"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Floating Options Dropdown Menu (High Contrast Elevated Island) -->
      <div
        *ngIf="isOpen"
        class="custom-select-menu absolute left-0 right-0 mt-2 min-w-[160px] z-[99999] rounded-2xl bg-[#1e1e24] border border-[#383842] border-t-[#00D4FF]/50 shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_25px_rgba(0,212,255,0.15)] p-1.5 space-y-1 animate-dropdownFade backdrop-blur-2xl max-h-64 overflow-y-auto"
      >
        <div
          *ngFor="let opt of options"
          (click)="selectOption(opt, $event)"
          class="custom-select-item px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-3 cursor-pointer select-none"
          [ngClass]="opt.value === value ? 'custom-select-active bg-[#00D4FF]/15 text-[#00D4FF] font-bold border border-[#00D4FF]/40 shadow-inner' : 'text-slate-200 hover:bg-[#282832] hover:text-white border border-transparent'"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span
              class="w-2 h-2 rounded-full shrink-0 transition-all"
              [ngClass]="opt.value === value ? 'bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]' : 'bg-slate-600'"
            ></span>
            <span class="truncate font-medium">{{ opt.label }}</span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span
              *ngIf="opt.badge"
              class="px-2 py-0.5 text-[9px] font-bold font-mono uppercase rounded-md"
              [ngClass]="opt.value === value ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40' : 'bg-[#141418] text-slate-400 border border-[#2a2a32]'"
            >
              {{ opt.badge }}
            </span>

            <svg
              *ngIf="opt.value === value"
              class="w-4 h-4 text-[#00D4FF] shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
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
      animation: dropdownFade 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    :host-context(html.light),
    :host-context(html.theme-light),
    :host-context(html[data-theme='light']) {
      .custom-select-trigger {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;

        &:hover {
          border-color: #0284c7 !important;
        }
      }

      .custom-select-menu {
        background-color: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
      }

      .custom-select-item {
        color: #334155 !important;

        &:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }

        &.custom-select-active {
          background-color: #e0f2fe !important;
          color: #0284c7 !important;
          border-color: #bae6fd !important;
        }
      }
    }
  `]

})

export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select Option';
  @Input() disabled = false;
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;

  private onChange: (val: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private elementRef: ElementRef) { }

  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : this.placeholder;
  }

  toggleOpen(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;

    if (!this.isOpen) {
      if (activeDropdown && activeDropdown !== this) {
        activeDropdown.close();
      }
      this.isOpen = true;
      activeDropdown = this;
    } else {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    if (activeDropdown === this) {
      activeDropdown = null;
    }
  }

  selectOption(option: SelectOption, event: Event): void {
    event.stopPropagation();
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
    this.close();
  }

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: (val: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
