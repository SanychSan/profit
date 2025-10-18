import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ViewCoinPageRoutingModule } from './view-coin-routing.module';
import { ViewCoinPage } from './view-coin.page';

describe('ViewMessagePage', () => {
  let component: ViewCoinPage;
  let fixture: ComponentFixture<ViewCoinPage>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ViewCoinPage],
      imports: [IonicModule.forRoot(), ViewCoinPageRoutingModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
