import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Coin } from 'src/app/types/coin.type';

@Component({
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinComponent {
  private platform = inject(Platform);

  @Input() coin?: Coin;

  isIos() {
    return this.platform.is('ios');
  }
}
