import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { UpdateGroupModal } from '@/components';
import { ExtendedGroupType } from '@/hooks';
import { renderWithChainProvider } from '@/tests/render';

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockGroup: ExtendedGroupType = {
  id: 1n,
  admin: 'admin_address',
  metadata:
    '{"title":"Test Group","authors":["Test Author"],"summary":"Test Summary","proposalForumURL":"https://example.com","details":"Test Description"}',
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
    renderWithChainProvider(<UpdateGroupModal {...mockProps} />);

    // Programmatically open the modal
    const modal = document.getElementById('test-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
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
