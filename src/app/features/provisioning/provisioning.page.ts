import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-provisioning-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class ProvisioningPage {}
