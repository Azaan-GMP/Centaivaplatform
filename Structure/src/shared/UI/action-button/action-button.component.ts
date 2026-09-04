import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './action-button.component.html',
})
export class ActionButtonComponent {
  @Input() icon: string = '';
  @Input() tooltip: string = '';
  @Input() colorClass: string = 'text-primary bg-primary/10 hover:bg-primary hover:text-white'; // default primary style
  @Input() iconClass: string = 'w-4 h-4'; // standard small icon size
  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event) {
    event.stopPropagation();
    this.clicked.emit(event);
  }
}
