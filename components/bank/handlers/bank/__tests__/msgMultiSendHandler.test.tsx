import { Input, Output } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { MsgMultiSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

import { HistoryBox } from '@/components/bank/components/historyBox';
import { TxMessage } from '@/components/bank/types';
import { clearAllMocks, mockRouter } from '@/tests';
import { renderWithChainProvider } from '@/tests/render';

import { MsgMultiSendHandler } from '../msgMultiSendHandler';

const createTx = (inputs: Input[], outputs: Output[], error?: string) => [
  {
    id: '1',
    message_index: 1,
    type: MsgMultiSend.typeUrl,
    sender: inputs[0].address,
    mentions: [],
    metadata: {
      inputs,
      outputs,
    },
    fee: { amount: [{ amount: '1', denom: 'utoken' }], gas: '1' },
    memo: '',
    height: 10,
    timestamp: '2023-05-10T12:00:00Z',
    error: error ?? '',
    proposal_ids: [],
  },
];
const render = (tx: TxMessage[]) => {
  renderWithChainProvider(
    <HistoryBox isLoading={false} address="address1" currentPage={1} sendTxs={tx} totalPages={2} />
  );
};

describe('MsgMultiSendHandler', () => {
  beforeEach(() => {
    mockRouter();
  });
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('send success', () => {
    const tx = createTx(
      [{ address: 'address1', coins: [{ amount: '2000000', denom: 'utoken' }] }],
      [
        { address: 'address2', coins: [{ amount: '1000000', denom: 'utoken' }] },
        { address: 'address3', coins: [{ amount: '1000000', denom: 'utoken' }] },
      ]
    );
    render(tx);
    expect(screen.getByText(/You sent/i)).toBeInTheDocument();
    expect(screen.getByText('2 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/equally divided between 2 addresses/i)).toBeInTheDocument();
  });

  test('send fail', () => {
    const tx = createTx(
      [{ address: 'address1', coins: [{ amount: '2000000', denom: 'utoken' }] }],
      [
        { address: 'address2', coins: [{ amount: '1000000', denom: 'utoken' }] },
        { address: 'address3', coins: [{ amount: '1000000', denom: 'utoken' }] },
      ],
      'fail!'
    );
    render(tx);
    expect(screen.getByText(/You failed to send/i)).toBeInTheDocument();
    expect(screen.getByText('2 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/equally divided between 2 addresses/i)).toBeInTheDocument();
  });

  test('receive', () => {
    const tx = createTx(
      [{ address: 'address2', coins: [{ amount: '2000000', denom: 'utoken' }] }],
      [
        { address: 'address1', coins: [{ amount: '1000000', denom: 'utoken' }] },
        { address: 'address3', coins: [{ amount: '1000000', denom: 'utoken' }] },
      ]
    );
    render(tx);
    expect(screen.getByText(/You received from/i)).toBeInTheDocument();
    expect(screen.getByText('1 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/address2/i)).toBeInTheDocument();
  });
});
