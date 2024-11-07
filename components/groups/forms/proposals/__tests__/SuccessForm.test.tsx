import { describe, test, afterEach, expect, jest, mock, afterAll } from 'bun:test';
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import ProposalSuccess from '@/components/groups/forms/proposals/SuccessForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposalFormData } from '@/tests/mock';

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockProps = {
  formData: mockProposalFormData,
  prevStep: jest.fn(),
};

describe('ProposalSuccess Component', () => {
  afterEach(cleanup);
  afterAll(() => {
    mock.restore();
  });

  test('renders static text correctly', () => {
    renderWithChainProvider(<ProposalSuccess {...mockProps} />);
    expect(screen.getByText('Proposal Submitted Successfully!')).toBeDefined();
    expect(
      screen.getByText('Your proposal has been successfully submitted to the group.')
    ).toBeDefined();
    expect(screen.getByText(/Group members can now vote on your proposal/)).toBeDefined();
  });

  test('renders dynamic text correctly', () => {
    renderWithChainProvider(<ProposalSuccess {...mockProps} />);
    expect(screen.getByText(mockProps.formData.title)).toBeDefined();
    expect(screen.getByText(mockProps.formData.metadata.summary)).toBeDefined();
    expect(screen.getByText(mockProps.formData.metadata.details)).toBeDefined();
    mockProps.formData.messages.forEach(message => {
      expect(screen.getByText(`${message.type}`)).toBeDefined();
    });
  });

  test('renders proposers correctly for single manifest address', () => {
    const singleProposerProps = {
      ...mockProps,
      formData: { ...mockProps.formData, proposers: 'manifest1abc123def456' },
    };
    renderWithChainProvider(<ProposalSuccess {...singleProposerProps} />);
    expect(screen.getByText('manifest1abc12...def456')).toBeDefined();
  });

  test('renders proposers correctly for non-manifest address', () => {
    const nonManifestProposerProps = {
      ...mockProps,
      formData: { ...mockProps.formData, proposers: 'John Doe' },
    };
    renderWithChainProvider(<ProposalSuccess {...nonManifestProposerProps} />);
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  test("renders 'Back to Groups Page' button", () => {
    renderWithChainProvider(<ProposalSuccess {...mockProps} />);
    expect(screen.getByText('Back to Groups Page')).toBeDefined();
  });
});
