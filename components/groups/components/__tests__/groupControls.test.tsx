import { ProposalSDKType } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/types';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { GroupControls } from '@/components/groups/components/groupControls';
import {
  clearAllMocks,
  formatComponent,
  mockModule,
  mockRouter,
  renderWithChainProvider,
} from '@/tests';

const mockProps = {
  group: {
    policies: [
      {
        address: 'test_policy_address',
        title: 'Test Policy',
        description: 'Test Policy Description',
      } as any,
    ],
  } as any,
  isLoading: false,
  txLoading: false,
  onBack: jest.fn(),
  currentPage: 0,
  setCurrentPage: jest.fn(),
  totalPages: 1,
  sendTxs: [],
  isError: false,
  balances: [],
  denoms: [],
  pageSize: 6,
  skeletonGroupCount: 0,
  skeletonTxCount: 0,
};

const mockProposal: ProposalSDKType = {
  executor_result: 2,
  final_tally_result: {
    yes_count: '1',
    no_count: '2',
    abstain_count: '3',
    no_with_veto_count: '4',
  },
  group_policy_address: 'address1',
  group_policy_version: 0n,
  group_version: 0n,
  id: 0n,
  messages: [],
  metadata: '',
  proposers: [],
  status: 2,
  submit_time: new Date(),
  summary: '',
  title: '',
  voting_period_end: new Date(),
};

describe('Tabs functionality', () => {
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders all tab options and switches between tabs correctly', async () => {
    mockRouter();
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [mockProposal],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));

    const mockup = renderWithChainProvider(<GroupControls {...mockProps} />);

    // Ensure all tabs are present in the DOM
    const proposalTab = screen.getByRole('tab', { name: /proposals/i });
    const assetsTab = screen.getByRole('tab', { name: /assets/i });
    const activityTab = screen.getByRole('tab', { name: /activity/i });
    const tokensTab = screen.getByRole('tab', { name: /tokens/i });

    expect(proposalTab).toBeInTheDocument();
    expect(assetsTab).toBeInTheDocument();
    expect(activityTab).toBeInTheDocument();
    expect(tokensTab).toBeInTheDocument();

    // Ensure the first tab is selected by default
    expect(screen.queryByTestId('proposals')).toBeInTheDocument();

    // Switch to "Assets" tab and verify the change
    fireEvent.click(assetsTab);
    expect(screen.queryByTestId('tokenList')).toBeInTheDocument();

    // Switch to "Activity" tab and verify the change
    fireEvent.click(activityTab);
    expect(screen.queryByTestId('tokenList')).not.toBeInTheDocument();
    expect(screen.queryByTestId('historyBox')).toBeInTheDocument();

    // Switch to "Tokens" tab and verify the change
    fireEvent.click(tokensTab);
    expect(screen.queryByTestId('historyBox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('denomList')).toBeInTheDocument();
  });

  test('routes properly', async () => {
    mockRouter({
      query: { tab: 'activity' },
    });
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [mockProposal],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));

    renderWithChainProvider(<GroupControls {...mockProps} />);
    expect(screen.queryByTestId('historyBox')).toBeInTheDocument();

    const assetsTab = screen.getByRole('tab', { name: /assets/i });
    fireEvent.click(assetsTab);
    expect(screen.queryByTestId('tokenList')).toBeInTheDocument();

    const router = require('next/router').useRouter();
    expect(router.push).toHaveBeenCalledWith(
      expect.not.objectContaining({ pathname: 'unused', query: { tab: 'assets' } }),
      undefined,
      { shallow: true }
    );
  });
});
