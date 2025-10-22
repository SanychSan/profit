
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SpotService } from 'src/app/services/spot.service';
import { CoinInterface } from 'src/app/classes/coin';

@Component({
  selector: 'app-view-coin',
  templateUrl: './view-coin.page.html',
  styleUrls: ['./view-coin.page.scss'],
  standalone: false,
})
export class ViewCoinPage implements OnInit {
  public coin!: CoinInterface;
  private spotService = inject(SpotService);
  private activatedRoute = inject(ActivatedRoute);
  private platform = inject(Platform);

  constructor() {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    // this.coin = this.spotService.getCoinByName(parseInt(id, 10));
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios')
    return isIos ? 'Inbox' : '';
  }
}
