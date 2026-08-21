import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-audit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class AuditPage {}
