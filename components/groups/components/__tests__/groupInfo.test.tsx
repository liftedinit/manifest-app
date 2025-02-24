import { afterAll, afterEach, describe, expect, test, jest, mock, beforeAll } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { GroupInfo } from '@/components/groups/modals/groupInfo';
import { renderWithChainProvider } from '@/tests/render';
import { manifestAddr1, manifestAddr2, mockGroup } from '@/tests/mock';

// Mock the useBalance hook
const m = jest.fn();
mock.module('@/hooks/useQueries', () => ({
  useBalance: m,
}));

// Mock next/router
const n = jest.fn();
mock.module('next/router', () => ({
  useRouter: n.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

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
  beforeAll(() => {
    m.mockReturnValue({ balance: { amount: '1000000' } });
  });
  afterEach(cleanup);
  afterAll(() => {
    mock.restore();
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
