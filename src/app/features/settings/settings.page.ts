import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ctv-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"></div>`,
})
export class SettingsPage {}
