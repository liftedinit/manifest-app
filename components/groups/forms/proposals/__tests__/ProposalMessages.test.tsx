import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import ProposalMessages from '@/components/groups/forms/proposals/ProposalMessages';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposalFormData } from '@/tests/mock';
import { SendMessage } from '@/helpers';

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
};

describe('ProposalMessages Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    expect(screen.getByText('Messages')).toBeDefined();
    expect(screen.getByText('Next: Proposal Metadata')).toBeDefined();
    expect(screen.getByText('Prev: Proposal Details')).toBeDefined();
  });

  test('next button is disabled when form is invalid', () => {
    const invalidFormData = {
      ...mockProposalFormData,
      messages: [
        {
          type: 'send',
          amount: { denom: '', amount: '' },
          to_address: '',
          from_address: '',
        } as SendMessage,
      ],
    };
    renderWithChainProvider(<ProposalMessages {...mockProps} formData={invalidFormData} />);
    const nextButton = screen.getByText('Next: Proposal Metadata') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  test('next button is enabled when form is valid', () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const nextButton = screen.getByText('Next: Proposal Metadata') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);
  });

  test('calls nextStep when next button is clicked', () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const nextButton = screen.getByText('Next: Proposal Metadata');
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test('calls prevStep when prev button is clicked', () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const prevButton = screen.getByText('Prev: Proposal Details');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });

  test('adds and removes messages correctly', async () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const addButton = screen.getByLabelText('add-message-btn');
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'ADD_MESSAGE',
        message: expect.any(Object),
      });
    });

    const removeButton = screen.getByLabelText('remove-message-btn');
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_MESSAGE',
        index: expect.any(Number),
      });
    });
  });

  test('updates message fields correctly', async () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const toggleButton = screen.getByRole('button', {
      name: /toggle message visibility/i,
    });
    fireEvent.click(toggleButton);
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '200' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MESSAGE',
        index: expect.any(Number),
        message: expect.objectContaining({
          amount: expect.objectContaining({ amount: '200' }),
        }),
      });
    });
  });

  test('filters messages based on search term', () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Search Messages');
    fireEvent.change(searchInput, { target: { value: 'send' } });
    expect(screen.getAllByText(/send/i).length).toBeGreaterThan(0);
  });
});
