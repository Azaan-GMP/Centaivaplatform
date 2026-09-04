import { Injectable } from '@angular/core';
import { ToastrService as Toastr } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  constructor(
    private toastr: Toastr
  ) { }

  success(message: string, title?: string) {
    this.toastr.success(message, title);
  }

  error(message: string, title?: string) {
    this.toastr.error(message, title);
  }

  info(message: string, title?: string) {
    this.toastr.info(message, title);
  }

  warn(message: string, title?: string) {
    this.toastr.warning(message, title);
  }
}
