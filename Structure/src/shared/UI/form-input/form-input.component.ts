import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      <label class="form-label" *ngIf="label">
        {{ label }}
        <span class="required" *ngIf="required">*</span>
      </label>
      <input
        [type]="type"
        class="form-control"
        [class.is-invalid]="control?.invalid && control?.touched"
        [placeholder]="placeholder"
        [value]="value"
        (change)="onChange($event)"
        (blur)="onTouched()"
        [disabled]="disabled" />
      <div class="invalid-feedback" *ngIf="errorMessage && control?.invalid && control?.touched">
        {{ errorMessage }}
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() control: FormControl | null = null;
  @Input() errorMessage = '';

  value = '';
  disabled = false;

  onChange: (val: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = (event: any) => fn(event.target.value);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
