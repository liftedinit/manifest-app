import { MsgSend } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/tx';
import { CoinSDKType } from '@liftedinit/manifestjs/src/codegen/cosmos/base/v1beta1/coin';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';

import { HistoryBox } from '@/components/bank/components/historyBox';
import { TxMessage } from '@/components/bank/types';
import { renderWithChainProvider } from '@/tests/render';

import { MsgSendHandler } from '../msgSendHandler';

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const createTx = (sender: string, amount: CoinSDKType[], toAddress: string, error?: string) => [
  {
    id: '1',
    message_index: 1,
    type: MsgSend.typeUrl,
    sender,
    mentions: [],
    metadata: {
      amount,
      toAddress,
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

describe('MsgSendHandler', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
  });

  test('send success', () => {
    const tx = createTx('address1', [{ amount: '2000000', denom: 'utoken' }], 'address2');
    render(tx);
    expect(screen.getByText(/You sent to/i)).toBeInTheDocument();
    expect(screen.getByText('2 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/address2/i)).toBeInTheDocument();
  });

  test('send fail', () => {
    const tx = createTx('address1', [{ amount: '2000000', denom: 'utoken' }], 'address2', 'fail!');
    render(tx);
    expect(screen.getByText(/You failed to send to/i)).toBeInTheDocument();
    expect(screen.getByText('2 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/address2/i)).toBeInTheDocument();
  });

  test('receive', () => {
    const tx = createTx('address2', [{ amount: '2000000', denom: 'utoken' }], 'address1');
    render(tx);
    expect(screen.getByText(/You received from/i)).toBeInTheDocument();
    expect(screen.getByText('2 TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/address2/i)).toBeInTheDocument();
  });

  // TODO: Implement those when https://github.com/liftedinit/manifest-app/pull/285 is merged
  // test('send two denoms', () => {
  //   const tx = createTx(
  //     'address1',
  //     [
  //       { amount: '2000000', denom: 'utoken' },
  //       { amount: '3000000', denom: 'ufoobar' },
  //     ],
  //     'address2'
  //   );
  //   render(tx);
  //   expect(screen.getByText(/You sent to/i)).toBeInTheDocument();
  //   expect(screen.getByText('2 TOKEN, 3 FOOBAR')).toBeInTheDocument();
  //   expect(screen.getByText(/address2/i)).toBeInTheDocument();
  // });
});
