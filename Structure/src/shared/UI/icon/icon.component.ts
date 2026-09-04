import { Component, Input } from '@angular/core';
import { ICONS } from './icon.registry';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: string = '20';

  constructor(private sanitizer: DomSanitizer) { }

  get svg(): SafeHtml | null {
    if (this.name.startsWith('fa-')) return null;

    const rawSvg = ICONS[this.name];
    if (!rawSvg) return null;

    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }
}
