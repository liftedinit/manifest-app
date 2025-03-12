import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import GroupPolicyForm from '@/components/groups/forms/groups/GroupPolicyForm';
import { clearAllMocks, mockRouter } from '@/tests';
import { mockGroupFormData } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
};

describe('GroupPolicyForm Component', () => {
  beforeEach(() => {
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
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
    fireEvent.change(votingThresholdInput, { target: { value: 2 } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'votingThreshold',
        value: 2,
      });
    });
    const nextButton = screen.getByText('Next: Confirmation');
    expect(nextButton).toBeEnabled();
  });

  test('next button is disabled if voting threshold is higher than total members', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const votingThresholdInput = screen.getByPlaceholderText('e.g., 1');
    fireEvent.change(votingThresholdInput, { target: { value: 3 } });
    const nextButton = screen.getByText('Next: Confirmation');
    expect(nextButton).toBeDisabled();
  });

  test('next button is disabled when form is not dirty', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Confirmation');
    expect(nextButton).toBeDisabled();
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<GroupPolicyForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Confirmation');
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
    const nextButton = screen.getByText('Next: Confirmation');
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
    const prevButton = screen.getByText('Back: Group Members');
    fireEvent.click(prevButton);
    await waitFor(() => {
      expect(mockProps.prevStep).toHaveBeenCalled();
    });
  });
});
