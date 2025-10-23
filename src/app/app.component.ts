import { Component, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  private swUpdate = inject(SwUpdate);

  constructor() {
    this.swUpdate.versionUpdates.subscribe(e => {
      console.log('SW Update event:', e);
      if (e.type === 'VERSION_READY') {
        // reload for get new version
        location.reload();
      }
    });
  }
}
