import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  signal,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { BybitAPITxsService } from 'src/app/services/bybit-api-txs.service';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.page.html',
  styleUrls: ['./credentials.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CredentialsPage implements OnDestroy {
  private bybitAPITxsService = inject(BybitAPITxsService);
  private router = inject(Router);
  private destroyRef1;
  private destroyRef2;

  public apiKeyValue = signal('');
  public apiKey2Value = signal('');
  public hasCredentials = this.bybitAPITxsService.hasCredentials;
  public pristine = signal(true);

  constructor() {
    this.destroyRef1 = effect(() => {
      const savedKey = this.bybitAPITxsService.apiKey();
      this.apiKeyValue.set(savedKey);
    });
    this.destroyRef2 = effect(() => {
      const savedKey = this.bybitAPITxsService.apiKey2();
      if (savedKey) {
        this.apiKey2Value.set('******');
      }
    });
  }

  ngOnDestroy() {
    this.destroyRef1.destroy();
    this.destroyRef2.destroy();
  }

  changeApiKey(event: Event, key: 'apiKey' | 'apiKey2') {
    this.pristine.set(false);
    const value = (event.target as HTMLInputElement).value;

    if (key === 'apiKey') {
      this.apiKeyValue.set(value);
    } else {
      this.apiKey2Value.set(value);
    }
  }

  async saveCredentials() {
    await this.bybitAPITxsService.setApiCredentials(this.apiKeyValue(), this.apiKey2Value());
    this.pristine.set(true);
    this.router.navigateByUrl('/');
  }

  async clearCredentials() {
    await this.bybitAPITxsService.clearCredentials();
    this.pristine.set(true);
  }
}
