import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import MemberInfoForm from '@/components/groups/forms/groups/MemberInfoForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroupFormData } from '@/tests/mock';

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
  prevStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
  address: 'manifest1address',
};

describe('MemberInfoForm Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  test('renders component with correct details', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    expect(screen.getByText('Member Info')).toBeTruthy();
    expect(screen.getAllByLabelText('Address')[0]).toBeTruthy();
    expect(screen.getAllByLabelText('Name')[0]).toBeTruthy();
    expect(screen.getAllByLabelText('Weight')[0]).toBeTruthy();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const addressInput = screen.getAllByLabelText('Address')[0] as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: 'manifest1newaddress' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'address',
        value: 'manifest1newaddress',
      });
    });

    const nameInput = screen.getAllByLabelText('Name')[0] as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'name',
        value: 'New Name',
      });
    });

    const weightInput = screen.getAllByLabelText('Weight')[0] as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: '3' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'weight',
        value: '3',
      });
    });
  });

  test('next button is disabled when address is invalid', async () => {
    const invalidFormData = {
      ...mockGroupFormData,
      members: [{ address: 'invalid_address', name: 'Test', weight: '1' }],
    };
    renderWithChainProvider(<MemberInfoForm {...mockProps} formData={invalidFormData} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Address')).toHaveValue('invalid_address');
    });
    const addressInput = screen.getByLabelText('Address');
    fireEvent.blur(addressInput);
    await waitFor(
      () => {
        const nextButton = screen.getByText('Next: Group Policy');
        expect(nextButton).toBeDisabled();
      },
      { timeout: 2000 }
    );
  });

  test('next button is enabled when form is valid', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Group Policy');
      expect(nextButton).toBeEnabled();
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Group Policy');
    await waitFor(() => expect(nextButton).toBeEnabled());
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  test('calls prevStep when prev button is clicked', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const prevButton = screen.getByText('Back: Group Details');
    fireEvent.click(prevButton);
    await waitFor(() => {
      expect(mockProps.prevStep).toHaveBeenCalled();
    });
  });
});
