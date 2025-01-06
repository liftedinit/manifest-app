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
    expect(screen.getByPlaceholderText('Days')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hours')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minutes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seconds')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 1')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const hoursInput = screen.getByPlaceholderText('Hours');
    fireEvent.change(hoursInput, { target: { value: '2' } });
    expect(hoursInput).toHaveValue(2);

    const votingThresholdInput = screen.getByPlaceholderText('e.g., 1');
    fireEvent.change(votingThresholdInput, { target: { value: 3 } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'votingThreshold',
        value: 3,
      });
    });
  });

  test('next button is disabled when form is not dirty', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Member Info');
    expect(nextButton).toBeDisabled();
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Member Info');
    expect(nextButton).toBeDisabled();

    const votingAmountInput = screen.getByPlaceholderText('Hours');
    fireEvent.change(votingAmountInput, { target: { value: '2' } });
    expect(votingAmountInput).toHaveValue(2);
    expect(nextButton).toBeEnabled();
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const votingAmountInput = screen.getByPlaceholderText('Hours');
    fireEvent.change(votingAmountInput, { target: { value: '2' } });
    const nextButton = screen.getByText('Next: Member Info');
    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  test('calls prevStep when prev button is clicked', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const prevButton = screen.getByText('Back: Group Details');
    fireEvent.click(prevButton);
    await waitFor(() => {
      expect(mockProps.prevStep).toHaveBeenCalled();
    });
  });
});
