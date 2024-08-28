import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import ConfirmationModal from '@/components/groups/forms/proposals/ConfirmationForm';
import matchers from '@testing-library/jest-dom/matchers';
import { ProposalFormData } from '@/helpers/formReducer';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const mockFormData: ProposalFormData = {
  title: 'Test Proposal',
  proposers: 'manifest1proposer',
  summary: 'This is a test proposal',
  metadata: {
    title: 'Test Metadata Title',
    authors: 'manifest1author',
    summary: 'This is a test summary',
    details: 'Detailed description of the test proposal',
  },
  messages: [
    {
      type: 'send',
      amount: { denom: 'umfx', amount: '100' },
      to_address: 'manifest1recipient',
      from_address: 'manifest1from'
    },
  ],
};

const mockProps = {
  policyAddress: 'manifest1policy',
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockFormData,
  address: 'cosmos1address',
};

describe('ConfirmationModal Component', () => {
  afterEach(cleanup);

  test('renders component with correct details', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByLabelText('proposal-details')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.title)).toBeInTheDocument();
    expect(screen.getByText('manifest1propo...oposer')).toBeInTheDocument();

    // TODO: This is never displayed in the component
    // expect(screen.getByText(mockFormData.summary)).toBeInTheDocument();

    expect(screen.getByText('MESSAGES')).toBeInTheDocument();
    expect(screen.getByText('METADATA')).toBeInTheDocument();
    expect(screen.getByLabelText('meta-details')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.metadata.title)).toBeInTheDocument();
    expect(screen.getByText(mockFormData.metadata.summary)).toBeInTheDocument();
    expect(screen.getByText(mockFormData.metadata.details)).toBeInTheDocument();
  });

  test('calls prevStep when "Prev: Metadata" button is clicked', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const prevButton = screen.getByText('Prev: Metadata');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });


  test('disables "Sign Transaction" button when isSigning is true', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });

  test('disables "Sign Transaction" button when address is not provided', () => {
    const propsWithoutAddress = { ...mockProps, address: '' };
    renderWithChainProvider(<ConfirmationModal {...propsWithoutAddress} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });
});
