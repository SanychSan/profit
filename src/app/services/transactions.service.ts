import { Injectable, WritableSignal, signal } from '@angular/core';

import { Transaction } from 'src/app/types/transaction.type';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  public spot: WritableSignal<Transaction[]> = signal([
    {
      spotPair: 'LTCUSDT',
      feeCoin: 'LTC',
      execFeeV2: 0.012166902,
      feeInfo: {
        LTC: '0.01845207'
      },
      orderType: 'LIMIT',
      direction: 'BUY',
      filledValue: 981.7105465,
      avgFilledPrice: 95.76589421674639,
      orderPrice: 97.55,
      orderQuantity: 10.25115,
      orderValue: 999.9996825,
      orderStatus: 'FILLED',
      orderNo: '36766464',
      timestamp: '21:53 2025-10-10'
    },
    {
      spotPair: 'ASTERUSDT',
      feeCoin: 'ASTER',
      execFeeV2: 0.63291,
      feeInfo: {
        ASTER: '0.63291'
      },
      orderType: 'LIMIT',
      direction: 'BUY',
      filledValue: 999.9978,
      avgFilledPrice: 1.58,
      orderPrice: 1.58,
      orderQuantity: 632.91,
      orderValue: 999.9978,
      orderStatus: 'FILLED',
      orderNo: '42123264',
      timestamp: '14:26 2025-10-10'
    },
    {
      spotPair: 'LTCUSDT',
      feeCoin: 'LTC',
      execFeeV2: 1e-8,
      feeInfo: {
        LTC: '0.00751314'
      },
      orderType: 'LIMIT',
      direction: 'BUY',
      filledValue: 1003.755504,
      avgFilledPrice: 133.6,
      orderPrice: 133.6,
      orderQuantity: 7.51314,
      orderValue: 1003.755504,
      orderStatus: 'FILLED',
      orderNo: '68282368',
      timestamp: '14:17 2025-10-10'
    },
    {
      spotPair: 'ETHUSDT',
      feeCoin: 'ETH',
      execFeeV2: 0.001,
      feeInfo: {
        ETH: '0.001'
      },
      orderType: 'LIMIT',
      direction: 'BUY',
      filledValue: 4201,
      avgFilledPrice: 4201,
      orderPrice: 4201,
      orderQuantity: 1,
      orderValue: 4201,
      orderStatus: 'FILLED',
      orderNo: '23675136',
      timestamp: '15:42 2025-10-09'
    },
    {
      spotPair: 'XRPUSDT',
      feeCoin: 'XRP',
      execFeeV2: 0.4,
      feeInfo: {
        XRP: '0.4'
      },
      orderType: 'LIMIT',
      direction: 'BUY',
      filledValue: 960,
      avgFilledPrice: 2.4,
      orderPrice: 2.4,
      orderQuantity: 400,
      orderValue: 960,
      orderStatus: 'FILLED',
      orderNo: '63874048',
      timestamp: '21:29 2025-10-07'
    }
  ]);
}
