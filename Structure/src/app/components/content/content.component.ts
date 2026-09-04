import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/main-layout/header/header.component';
import { FooterComponent } from '../../layout/main-layout/footer/footer.component';
import { SidebarComponent } from '../../layout/main-layout/sidebar/sidebar.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
}
