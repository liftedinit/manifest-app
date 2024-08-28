import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import ConfirmationModal from '@/components/groups/forms/groups/ConfirmationForm';
import matchers from '@testing-library/jest-dom/matchers';
import { FormData } from '@/helpers/formReducer';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const mockFormData: FormData = {
  title: 'Test Group',
  authors: 'manifest1author',
  summary: 'This is a test group',
  description: 'Detailed description of the test group',
  forumLink: 'http://forumlink.com',
  votingThreshold: '50%',
  votingPeriod: { seconds: BigInt(3600), nanos: 0 },
  members: [
    { address: 'manifest1member1', name: 'Member 1', weight: '1' },
    { address: 'manifest1member2', name: 'Member 2', weight: '2' },
  ],
};

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockFormData,
};

describe('ConfirmationModal Component', () => {
  afterEach(cleanup);

  test('renders component with correct details', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('GROUP DETAILS')).toBeInTheDocument();
    expect(screen.getByText('GROUP TITLE')).toBeInTheDocument();
    expect(screen.getByText('AUTHORS')).toBeInTheDocument();
    expect(screen.getByText('SUMMARY')).toBeInTheDocument();
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('THRESHOLD')).toBeInTheDocument();
    expect(screen.getByText('VOTING PERIOD')).toBeInTheDocument();
    expect(screen.getByText('MEMBERS')).toBeInTheDocument();
  });

  test('calls prevStep when "Prev: Member Info" button is clicked', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const prevButton = screen.getByText('Prev: Member Info');
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
    mock.module('@/hooks/useChain', () => ({
      useChain: () => ({ address: '' }),
    }));
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });
});
