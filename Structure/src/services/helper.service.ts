import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private internetStatus = new BehaviorSubject(true);
  _getInternetStatus = this.internetStatus.asObservable();


  patternValidator(pattern: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && !pattern.test(value)) {
        return { 'pattern': true };
      }
      return null;
    };
  }

  emailValidator(): ValidatorFn {
    return this.patternValidator(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  }

  setInternetStatus(value: boolean) {
    return this.internetStatus.next(value)
  }

}
