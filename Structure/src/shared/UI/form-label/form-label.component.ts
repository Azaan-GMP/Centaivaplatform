import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-form-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-label.component.html',
  styleUrl: './form-label.component.scss'
})
export class FormLabelComponent {
  @Input() formLabel: string = '';
  @Input() for: string = '';
  @Input() required: boolean = false;

}
