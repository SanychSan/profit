type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
type Direction = 'BUY' | 'SELL';
type OrderStatus =
  | 'NEW'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELED'
  | 'PENDING_CANCEL'
  | 'REJECTED'
  | 'EXPIRED';

export interface Transaction {
  spotPair: string;
  feeCoin: string;
  execFeeV2: number;
  feeInfo: Record<string, any>;
  orderType: OrderType;
  direction: Direction;
  filledValue: number;
  avgFilledPrice: number;
  orderPrice: number;
  orderQuantity: number;
  orderValue: number;
  orderStatus: OrderStatus;
  orderNo: string;
  timestamp: string;
}
