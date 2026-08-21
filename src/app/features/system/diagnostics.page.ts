import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-diagnostics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class DiagnosticsPage {}
