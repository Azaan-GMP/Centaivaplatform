import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-usage-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class UsagePage {}
