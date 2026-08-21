import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-data-stores-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class DataStoresPage {}
