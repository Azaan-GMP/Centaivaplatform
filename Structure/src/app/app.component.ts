import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from '../services/helper.service';
import { ToastrService } from '../services/toastr.service';
import { NetworkStatusService } from '../services/network-status.service';
import { CommonModule } from '@angular/common';
import { NoInternetScreenComponent } from '../shared/UI/no-internet-screen/no-internet-screen.component';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NoInternetScreenComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  online$: Observable<boolean> | undefined;
  showNoInternetScreen = false;

  constructor(
    private helperService: HelperService,
    private toaster: ToastrService,
    private router: Router,
    private networkStatusService: NetworkStatusService,
  ) { }

  ngOnInit() {
    this.online$ = this.networkStatusService.isOnline$;
    this.networkStatusService.isOnline$.subscribe((isOnline) => {
      if (!isOnline) {
        this.helperService.setInternetStatus(false);
        this.showNoInternetScreen = true;
        this.toaster.error('You are offline. Please check your internet connection.');
      } else {
        this.helperService.setInternetStatus(true);
        this.showNoInternetScreen = false;
      }
    });
  }

  ngAfterViewInit() {
    initFlowbite();

    this.router?.events?.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => initFlowbite(), 0);
      }
    });
  }
}
