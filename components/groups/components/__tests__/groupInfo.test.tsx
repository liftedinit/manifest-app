import { afterAll, afterEach, describe, expect, test, jest, mock, beforeAll } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { GroupInfo } from '@/components/groups/modals/groupInfo';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroup } from '@/tests/mock';

expect.extend(matchers);

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
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('author1, author2')).toBeInTheDocument();
  });

  test("renders 'No authors available' when no authors are provided", () => {
    const props = {
      ...defaultProps,
      group: {
        ...defaultProps.group,
        metadata:
          '{"title": "title1", "summary": "summary1", "details": "details1", "authors": [], "voteOptionContext": "context1"}',
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
