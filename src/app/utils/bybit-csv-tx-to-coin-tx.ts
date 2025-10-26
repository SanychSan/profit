import { BybitCSVTx } from 'src/app/types/transaction.type';
import { Transaction as CoinTransaction } from 'src/app/classes/coin';

export const bybitCsvTxToCoinTx = (tx: BybitCSVTx): CoinTransaction => {
  return {
    id: tx['Transaction ID'],
    direction: tx['Direction'].toLowerCase() === 'buy' ? 'BUY' : 'SELL',
    qty: Number(tx['Filled Quantity']),
    price: Number(tx['Filled Price']),
    fees: Number(tx['Fees']),
    timestamp: new Date(tx['Timestamp (UTC)']).getTime()
  };
};
