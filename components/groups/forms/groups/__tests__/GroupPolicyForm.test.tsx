import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import GroupPolicyForm from '@/components/groups/forms/groups/GroupPolicyForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroupFormData } from '@/tests/mock';

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
};

describe('GroupPolicyForm Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    expect(screen.getByText('Group Policy')).toBeInTheDocument();
    expect(screen.getByText('Voting Period')).toBeInTheDocument();
    expect(screen.getByText('Voting Threshold')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const votingAmountInput = screen.getByPlaceholderText('Enter duration');
    fireEvent.change(votingAmountInput, { target: { value: '2' } });
    expect(votingAmountInput).toHaveValue(2);

    const votingThresholdInput = screen.getByPlaceholderText('e.g. (1)');
    fireEvent.change(votingThresholdInput, { target: { value: '3' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'votingThreshold',
        value: '3',
      });
    });
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const votingThresholdInput = screen.getByPlaceholderText('e.g. (1)');
    fireEvent.change(votingThresholdInput, { target: { value: '3' } });
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Member Info');
      expect(nextButton).toBeEnabled();
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const votingThresholdInput = screen.getByPlaceholderText('e.g. (1)');
    fireEvent.change(votingThresholdInput, { target: { value: '3' } });
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Member Info');
      expect(nextButton).toBeEnabled();
    });
    const nextButton = screen.getByText('Next: Member Info');
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test('calls prevStep when prev button is clicked', () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const prevButton = screen.getByText('Prev: Group Details');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });
});
