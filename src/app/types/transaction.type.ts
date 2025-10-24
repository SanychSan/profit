type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
type Direction = 'BUY' | 'SELL';

export const TransactionKeys = [
  'Spot Pairs',
  'Order Type',
  'Direction',
  'feeCoin',
  'ExecFeeV2',
  'Filled Value',
  'Filled Price',
  'Filled Quantity',
  'Fees',
  'Transaction ID',
  'Order No.',
  'Timestamp (UTC)'
] as const;

export type TransactionKey = (typeof TransactionKeys)[number];
export type TransactionRaw = { [key in TransactionKey]: string };

export interface Transaction {
  SpotPairs: string;
  OrderType: OrderType;
  Direction: Direction;
  feeCoin: string;
  ExecFeeV2: string | number;
  FilledValue: number;
  FilledPrice: number;
  FilledQuantity: number;
  Fees: number;
  TransactionID: string;
  OrderNo: string;
  Timestamp: string;
}
