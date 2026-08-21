import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-security-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class SecurityPage {}
