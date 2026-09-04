import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html'
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() maxWidthClass = 'max-w-xl';
  @Input() showCloseButton = true;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
    @HostListener('document:keydown.escape')
  onEsc() {
    if (this.isOpen) {
      this.closed.emit();
    }
  }
}