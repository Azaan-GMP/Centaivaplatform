import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-subscriptions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class SubscriptionsPage {}
