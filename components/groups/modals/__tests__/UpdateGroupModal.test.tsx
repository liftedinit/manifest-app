import { describe, test, expect, beforeEach, jest } from 'bun:test';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { UpdateGroupModal } from '@/components';
import { renderWithChainProvider } from '@/tests/render';

// Mock group data
const mockProps = {
  group: {
    id: '1',
    admin: 'admin_address',
    metadata:
      '{"title":"Test Group","authors":"Test Author","summary":"Test Summary","proposalForumURL":"https://example.com","details":"Test Description"}',
    members: [
      {
        group_id: '1',
        member: {
          address: 'member1_address',
          metadata: 'Member 1',
          weight: '1',
          added_at: new Date(),
          isCoreMember: true,
          isActive: true,
        },
      },
    ],
    policies: [
      {
        address: 'policy_address',
        admin: 'admin_address',
        decision_policy: {
          threshold: '1',
          windows: {
            voting_period: '86400s',
          },
        },
      },
    ],
  },
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
    const nameInput = screen.getByLabelText('Group Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Group Name' } });
    expect(nameInput.value).toBe('New Group Name');

    // Test authors input
    const authorsInput = screen.getByLabelText('Authors') as HTMLInputElement;
    fireEvent.change(authorsInput, { target: { value: 'New Author' } });
    expect(authorsInput.value).toBe('New Author');

    // Test summary input
    const summaryInput = screen.getByLabelText('Summary') as HTMLInputElement;
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    expect(summaryInput.value).toBe('New Summary');

    // Test threshold input
    const thresholdInput = screen.getByLabelText('Threshold') as HTMLInputElement;
    fireEvent.change(thresholdInput, { target: { value: '2' } });
    expect(thresholdInput.value).toBe('2');

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
