type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
type Direction = 'BUY' | 'SELL';

export interface TransactionRaw {
  'Spot Pairs': string;
  'Order Type': OrderType;
  Direction: Direction;
  feeCoin: string;
  ExecFeeV2: string|number;
  'Filled Value': number;
  'Filled Price': number;
  'Filled Quantity': number;
  Fees: number;
  'Transaction ID': number;
  'Order No.': string | number;
  'Timestamp (UTC)': string;
}

export interface Transaction {
  SpotPairs: string;
  OrderType: OrderType;
  Direction: Direction;
  feeCoin: string;
  ExecFeeV2: number;
  FilledValue: number;
  FilledPrice: number;
  FilledQuantity: number;
  Fees: number;
  TransactionID: number;
  OrderNo: number;
  Timestamp: string;
}
