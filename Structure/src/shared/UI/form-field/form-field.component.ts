import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html'
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() required = false;
  @Input() hint = '';
  @Input() errorMessage = '';
}
