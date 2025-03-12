import { RenderResult, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { UpdateFormValues, UpdateGroupForm, UpdateGroupModal } from '@/components';
import { env } from '@/config';
import { ExtendedGroupType } from '@/hooks';
import { duration } from '@/schemas';
import { clearAllMocks, mockRouter } from '@/tests';
import { renderWithChainProvider } from '@/tests/render';

const mockGroup: ExtendedGroupType = {
  id: 1n,
  admin: 'admin_address',
  metadata: JSON.stringify({
    title: 'Test Group',
    authors: ['manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf'],
    details: 'Test Description That is at least 20 characters',
  }),
  members: [
    {
      group_id: 1n,
      member: {
        address: 'member1_address',
        metadata: 'Member 1',
        weight: '1',
        added_at: new Date(),
      },
    },
  ],
  policies: [
    {
      group_id: 1n,
      address: 'policy_address',
      admin: 'admin_address',
      decision_policy: {
        threshold: '1',
        windows: {
          voting_period: { seconds: 86400n, nanos: 0 },
          min_execution_period: { seconds: 86400n, nanos: 0 },
        },
      },
      metadata: '',
      version: 0n,
      created_at: new Date(),
    },
  ],
  total_weight: '',
  version: 0n,
  created_at: new Date(),
};

// Mock group data
const mockProps = {
  group: mockGroup,
  address: 'group_address',
  modalId: 'test-modal',
  policyAddress: 'policy_address',
  showUpdateModal: true,
  setShowUpdateModal: jest.fn(),
  onUpdate: jest.fn(),
};

describe('UpdateGroupModal Component Input State Changes', () => {
  beforeEach(() => {
    mockRouter();
    renderWithChainProvider(<UpdateGroupModal {...mockProps} />);

    // Programmatically open the modal
    const modal = document.getElementById('test-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  });

  afterEach(() => {
    clearAllMocks();
    cleanup();
  });

  test('updates input fields correctly', async () => {
    // Test name input
    const nameInput = screen.getByLabelText('Group Title') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Group Name' } });
    expect(nameInput.value).toBe('New Group Name');

    const addAuthorButton = screen.getByText('Add Author');
    fireEvent.click(addAuthorButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Author name or address')).toBeInTheDocument();
    });

    // Test authors input
    const authorsInput = screen.getByLabelText('Author name or address') as HTMLInputElement;
    fireEvent.change(authorsInput, { target: { value: 'New Author' } });
    expect(authorsInput.value).toBe('New Author');

    // // Test threshold input
    // const thresholdInput = screen.getByLabelText('Qualified Majority') as HTMLInputElement;
    // fireEvent.change(thresholdInput, { target: { value: '2' } });
    // expect(thresholdInput.value).toBe('2');
    //
    // Test voting unit select
    const minutes = screen.getByLabelText('Minutes') as HTMLSelectElement;
    fireEvent.change(minutes, { target: { value: '30' } });
    expect(minutes.value).toBe('30');

    // Test description input
    const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    expect(descriptionInput.value).toBe('New Description');
  });
});

const mockValues: UpdateFormValues = {
  threshold: 1,
  votingPeriod: duration.fromSeconds(env.minimumVotingPeriod),
  title: 'Test Group',
  authors: ['manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf'],
  details: 'Test Description That is at least 20 characters',
  voteOptionContext: '',
};

describe('UpdateGroupForm', () => {
  beforeEach(() => {
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  function changeField(field: HTMLElement, value: string) {
    field.focus();
    fireEvent.change(field, { target: { value } });
    field.blur();
  }

  function waitForUpdateButtonToBeEnabled(mockup: RenderResult) {
    return waitFor(() => {
      expect(mockup.getByTestId('update-btn')).toBeEnabled();
    });
  }

  function waitForUpdateButtonToBeDisabled(mockup: RenderResult) {
    return waitFor(() => {
      expect(mockup.getByTestId('update-btn')).toBeDisabled();
    });
  }

  afterEach(cleanup);

  test('Group Title validates', async () => {
    const mockup = renderWithChainProvider(
      <UpdateGroupForm
        initialValues={mockValues}
        onSubmit={jest.fn()}
        setShowUpdateModal={jest.fn()}
        isSigning={false}
      />
    );

    const groupTitle = mockup.getByLabelText('Group Title') as HTMLInputElement;
    expect(groupTitle).toBeInTheDocument();

    changeField(groupTitle, '');
    await waitFor(() => {
      expect(mockup.getByText('Title is required')).toBeInTheDocument();
    });

    changeField(groupTitle, 'Profane title with FUCK in it');
    await waitFor(() => {
      expect(mockup.getByText('Profanity is not allowed')).toBeInTheDocument();
    });

    changeField(groupTitle, 'Hello World');
    await waitFor(() => expect(mockup.queryByText('Title is required')).not.toBeInTheDocument());
    await waitForUpdateButtonToBeEnabled(mockup);

    changeField(groupTitle, 'a'.repeat(51));
    await waitFor(() => {
      expect(mockup.getByText('Title must not exceed 50 characters')).toBeInTheDocument();
    });
    await waitForUpdateButtonToBeDisabled(mockup);
  });

  test('Group Details validates', async () => {
    const mockup = renderWithChainProvider(
      <UpdateGroupForm
        initialValues={mockValues}
        onSubmit={jest.fn()}
        setShowUpdateModal={jest.fn()}
        isSigning={false}
      />
    );

    const groupDetails = mockup.getByLabelText('Description') as HTMLInputElement;
    expect(groupDetails).toBeInTheDocument();

    changeField(groupDetails, '');
    await waitFor(() => {
      expect(mockup.getByText('Details is required')).toBeInTheDocument();
    });
    await waitForUpdateButtonToBeDisabled(mockup);

    changeField(groupDetails, 'Not Long Enough');
    await waitFor(() => {
      expect(mockup.queryByText('Details must be at least 20 characters')).toBeInTheDocument();
    });

    changeField(groupDetails, 'Long Enough But Using Profanity like FUCK');
    await waitFor(() => {
      expect(mockup.getByText('Profanity is not allowed')).toBeInTheDocument();
    });
  });

  test('Authors validates', async () => {
    const mockup = renderWithChainProvider(
      <UpdateGroupForm
        initialValues={mockValues}
        onSubmit={jest.fn()}
        setShowUpdateModal={jest.fn()}
        isSigning={false}
      />
    );

    // Make sure the initial author is in there.
    expect(mockup.getByDisplayValue(mockValues.authors[0])).toBeInTheDocument();

    // Update the group title so we have at least some dirty fields.
    changeField(mockup.getByLabelText('Group Title'), 'Hello World');
    await waitFor(() => {
      expect(mockup.getByTestId('update-btn')).toBeEnabled();
    });

    // Add an author. Update should still be disabled.
    mockup.getByTestId('add-author-btn').click();
    await waitFor(() => {
      expect(mockup.getByTestId('author-1')).toBeInTheDocument();
    });

    changeField(mockup.getByTestId('author-1'), 'Hello World');
    await waitFor(() => {
      expect(mockup.getByText('Invalid manifest address')).toBeInTheDocument();
    });

    changeField(mockup.getByTestId('author-1'), mockValues.authors[0]);
    await waitFor(() => {
      expect(mockup.getByText('Authors must be unique')).toBeInTheDocument();
    });
    await waitForUpdateButtonToBeDisabled(mockup);
  });

  test('Voting Period validates', async () => {
    const mockup = renderWithChainProvider(
      <UpdateGroupForm
        initialValues={mockValues}
        onSubmit={jest.fn()}
        setShowUpdateModal={jest.fn()}
        isSigning={false}
      />
    );

    // Make sure the initial author is in there.
    expect(mockup.getByDisplayValue(mockValues.authors[0])).toBeInTheDocument();

    // Update the group title so we have at least some dirty fields.
    changeField(mockup.getByLabelText('Group Title'), 'Hello World');

    changeField(mockup.getByTestId('voting-period-seconds'), '0');
    changeField(mockup.getByTestId('voting-period-minutes'), '0');
    changeField(mockup.getByTestId('voting-period-hours'), '0');

    let $errEl: any;
    await waitFor(() => {
      $errEl = mockup.getByText(/^Voting period must be at least \d+/);
      expect($errEl).toBeInTheDocument();
    });
  });
});
