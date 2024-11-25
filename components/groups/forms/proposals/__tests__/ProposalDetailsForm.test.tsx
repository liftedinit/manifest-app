import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import ProposalDetails from '@/components/groups/forms/proposals/ProposalDetailsForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposalFormData } from '@/tests/mock';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockProps = {
  nextStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('ProposalDetails Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    expect(screen.getByText('Proposal details')).toBeDefined();
    expect(screen.getByText('Next: Proposal Messages')).toBeDefined();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Proposal Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'title',
        value: 'New Title',
      });
    });

    const proposersInput = screen.getByLabelText('Proposer');
    fireEvent.change(proposersInput, { target: { value: 'New Proposer' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'proposers',
        value: 'New Proposer',
      });
    });

    const summaryInput = screen.getByLabelText('Summary');
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'summary',
        value: 'New Summary',
      });
    });
  });

  test('next button is enabled when form is valid', () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const nextButton = screen.getByText('Next: Proposal Messages');
    expect(nextButton).toBeEnabled();
  });

  test.skip('next button is disabled when form is invalid', async () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Proposers');
    fireEvent.change(titleInput, { target: { value: '' } });
    const nextButton = screen.getByText('Next: Proposal Messages');
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('next button is enabled when form is valid and dirty', async () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Proposal Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    const nextButton = screen.getByText('Next: Proposal Messages');
    await waitFor(() => expect(nextButton).toBeEnabled());
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const titleInput = screen.getByLabelText('Proposal Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    const nextButton = screen.getByText('Next: Proposal Messages');
    await waitFor(() => expect(nextButton).toBeEnabled());
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });
});
