// type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
// type Direction = 'BUY' | 'SELL';

export const BybitCSVTxKeys = [
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
export type BybitCSVTxKey = (typeof BybitCSVTxKeys)[number];
export type BybitCSVTx = { [key in BybitCSVTxKey]: string };

export const BybitAPITxKeys = [
  'bonusChange',
  'cashBalance',
  'cashFlow',
  'category',
  'change',
  'currency',
  'extraFees',
  'fee',
  'feeRate',
  'funding',
  'id',
  'orderId',
  'orderLinkId',
  'qty',
  'side',
  'size',
  'symbol',
  'tradeId',
  'tradePrice',
  'transSubType',
  'transactionTime',
  'type'
] as const;
export type BybitAPITxKey = (typeof BybitAPITxKeys)[number];
export type BybitAPITx = { [key in BybitAPITxKey]: string };
