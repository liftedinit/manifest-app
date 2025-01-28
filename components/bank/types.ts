export interface TransactionAmount {
  amount: string;
  denom: string;
}

interface TxFee {
  amount: TransactionAmount[];
  gas: string;
}

export interface TxMessage {
  id: string;
  message_index: number;
  type: string;
  sender: string;
  mentions: string[];
  metadata: any;
  fee: TxFee;
  memo: string;
  height: number;
  timestamp: string;
  error: string;
  proposal_ids: string[];
}
