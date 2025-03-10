import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { GroupInfo } from '@/components/groups/modals/groupInfo';
import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { manifestAddr1, manifestAddr2, mockGroup } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const defaultProps = {
  showInfoModal: true,
  setShowInfoModal: jest.fn(),
  group: mockGroup,
  address: 'test_address',
  policyAddress: 'test_policy_address',
  onUpdate: jest.fn(),
};

const renderWithProps = (props = {}) => {
  // Not passing
  //   groupByMemberDataLoading: boolean;
  //   groupByMemberDataError: boolean | Error | null;
  //   refetchGroupByMember: () => void;
  // is fine as they are not used in the component
  return renderWithChainProvider(<GroupInfo {...defaultProps} {...props} />);
};

describe('GroupInfo', () => {
  beforeEach(() => {
    // Mock the useBalance hook
    mockModule('@/hooks/useQueries', () => ({
      useBalance: jest.fn().mockReturnValue({ balance: { amount: '1000000' } }),
    }));

    // Mock next/router
    mockRouter();
  });
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders initial state correctly', () => {
    renderWithProps();
    expect(screen.getByText('title1')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Group Information')).toBeInTheDocument();
    expect(screen.getByText('Voting period')).toBeInTheDocument();
    expect(screen.getByText('No voting period')).toBeInTheDocument();
    expect(screen.getByText('Qualified Majority')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Using a RegExp of the first 20 characters as the address might be
    // truncated.
    expect(screen.getByText(new RegExp(manifestAddr1.slice(0, 20)))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(manifestAddr2.slice(0, 20)))).toBeInTheDocument();
  });

  test("renders 'No authors available' when no authors are provided", () => {
    const props = {
      ...defaultProps,
      group: {
        ...defaultProps.group,
        metadata:
          '{"title": "title1", "summary": "summary1", "details": "details1 at least 20 characters", "authors": [], "voteOptionContext": "context1"}',
      },
    };
    renderWithProps({ ...props });
    expect(screen.getByText('No authors available')).toBeInTheDocument();
  });

  test("renders 'No threshold available' when no threshold is provided", () => {
    const props = {
      ...defaultProps,
      group: {
        ...defaultProps.group,
        policies: [
          {
            ...defaultProps.group.policies[0],
            decision_policy: {
              threshold: undefined,
            },
          },
        ],
      },
    };
    renderWithProps({ ...props });
    expect(screen.getByText('No threshold available')).toBeInTheDocument();
  });

  test('triggers upgrade modal on button click', () => {
    renderWithProps();
    const updateButton = screen.getByLabelText('upgrade-btn');
    fireEvent.click(updateButton);
    const modal = screen.getByRole('dialog') as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(screen.getByLabelText('upgrade-group-btn')).toBeInTheDocument();
  });
});
