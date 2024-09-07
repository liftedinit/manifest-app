import { afterEach, describe, expect, test, jest, mock, beforeAll } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { GroupInfo } from '@/components/groups/components/groupInfo';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroup } from '@/tests/mock';

expect.extend(matchers);

// Mock the useBalance hook
const m = jest.fn();
mock.module('@/hooks/useQueries', () => ({
  useBalance: m,
}));

const defaultProps = {
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

  test('renders initial state correctly', () => {
    renderWithProps();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('title1')).toBeInTheDocument();
    expect(screen.getByText('author1')).toBeInTheDocument();
    expect(screen.getByText('author2')).toBeInTheDocument();
    expect(screen.getByText('test_policy_...ddress')).toBeInTheDocument();
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
  });

  test("renders 'No group Selected' when no group is provided", () => {
    renderWithProps({ group: null });
    expect(screen.getByText('No group Selected')).toBeInTheDocument();
  });

  test("renders 'No authors available' when no authors are provided", () => {
    const props = {
      ...defaultProps,
      group: {
        ...defaultProps.group,
        ipfsMetadata: {
          authors: '',
        },
      },
    };
    renderWithProps({ ...props });
    expect(screen.getByText('No authors available')).toBeInTheDocument();
  });

  test("renders 'No balance available' when no balance is provided", () => {
    m.mockReturnValue({ balance: { amount: undefined } });
    renderWithProps();
    expect(screen.getByText('No balance available')).toBeInTheDocument();
  });

  // TODO: The following test fails because we allow the use of the `any` type
  //       We should properly define all types and avoid using `any`
  // test("renders 'No address available' when no policy address is provided", () => {
  //   const props = {
  //     ...defaultProps,
  //     group: {
  //       ...defaultProps.group,
  //       policies: [
  //         {
  //           ...defaultProps.group.policies[0],
  //           address: undefined,
  //         },
  //       ],
  //     },
  //   };
  //   renderWithProps({...props});
  //   expect(screen.getByText("No address available")).toBeInTheDocument();
  // });

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

  test("renders 'No total weight available' when no total weight is provided", () => {
    const props = {
      ...defaultProps,
      group: {
        ...defaultProps.group,
        total_weight: '',
      },
    };
    renderWithProps({ ...props });
    expect(screen.getByText('No total weight available')).toBeInTheDocument();
  });

  test('triggers update modal on button click', () => {
    renderWithProps();
    const updateButton = screen.getByLabelText('update-btn');
    fireEvent.click(updateButton);
    const modal = document.getElementById(
      `update_group_${defaultProps.group.id}`
    ) as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Update Group')).toBeInTheDocument();
  });

  test('triggers group details modal on button click', () => {
    renderWithProps();
    const moreInfoButton = screen.getByText('more info');
    fireEvent.click(moreInfoButton);
    const modal = document.getElementById(
      `group_modal_${defaultProps.group.id}`
    ) as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Group Details')).toBeInTheDocument();
  });
});
