import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-deployments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class DeploymentsPage {}
