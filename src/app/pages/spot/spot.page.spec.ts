import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// import { MessageComponentModule } from '../message/message.module';

import { SpotPage } from './spot.page';

describe('HomePage', () => {
  let component: SpotPage;
  let fixture: ComponentFixture<SpotPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotPage],
      imports: [IonicModule.forRoot(), /* MessageComponentModule, */ RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SpotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
