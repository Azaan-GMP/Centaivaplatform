import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-invitations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class InvitationsPage {}
