import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-breadcrumb.component.html'
})
export class PageBreadcrumbComponent {
  @Input() title: string = '';
  @Input() breadcrumbs: { label: string; key?: string }[] = [];
  @Input() activeKey: string = '';
}