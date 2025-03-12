import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import ConfirmationModal from '@/components/groups/forms/groups/ConfirmationForm';
import { FormData } from '@/helpers/formReducer';
import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { renderWithChainProvider } from '@/tests/render';

const mockFormData: FormData = {
  title: 'Test Group',
  authors: 'manifest1author',
  description: 'Detailed description of the test group',
  votingThreshold: '50%',
  votingPeriod: { seconds: BigInt(3600), nanos: 0 },
  members: [
    { address: 'manifest1member1', name: 'Member 1' },
    { address: 'manifest1member2', name: 'Member 2' },
  ],
};

const mockProps = {
  address: '',
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockFormData,
};

describe('ConfirmationModal Component', () => {
  beforeEach(() => {
    mockRouter();
  });
  afterEach(() => {
    clearAllMocks();
    cleanup();
  });
  afterAll(() => {
    mock.restore();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Group Information')).toBeInTheDocument();
    expect(screen.getByText('Voting period')).toBeInTheDocument();
    expect(screen.getByText('Qualified Majority')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Authors')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  test('calls prevStep when "Prev: Member Info" button is clicked', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const prevButton = screen.getByText('Back: Group Policy');
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
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });
});
