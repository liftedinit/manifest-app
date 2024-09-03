import { describe, test, afterEach, expect } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { ValidatorDetailsModal } from '@/components/admins/modals/validatorModal';
import matchers from '@testing-library/jest-dom/matchers';
import { mockActiveValidators } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const validator = mockActiveValidators[0];
const modalId = 'test-modal';
const admin = 'manifest1adminaddress';
const totalvp = '10000';
const validatorVPArray = [{ vp: BigInt(1000), moniker: 'Validator One' }];

function renderWithProps(props = {}) {
  return renderWithChainProvider(
    <ValidatorDetailsModal
      validator={validator}
      modalId={modalId}
      admin={admin}
      totalvp={totalvp}
      validatorVPArray={validatorVPArray}
      {...props}
    />
  );
}

describe('ValidatorDetailsModal Component', () => {
  afterEach(cleanup);

  test('renders modal with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Validator Details')).toBeInTheDocument();
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.getByText('security1@foobar.com')).toBeInTheDocument();
    const detailsContainer = screen.getByLabelText('details');
    expect(within(detailsContainer).getByText('details1')).toBeInTheDocument();
  });

  test('updates input field correctly', async () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: '2000' } });
    await waitFor(() => {
      expect(input).toHaveValue(2000);
    });
  });

  test('enables update button when input is valid', async () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: '2000' } });
    await waitFor(() => {
      const updateButton = screen.getByText('Update');
      expect(updateButton).not.toBeDisabled();
    });
  });

  test('disables update button when input is invalid', async () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: '-1' } });
    fireEvent.blur(input);
    await waitFor(() => {
      const updateButton = screen.getByText('Update');
      expect(updateButton).toBeDisabled();
    });
  });

  test('shows error message for invalid power input', async () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: '-1' } });
    fireEvent.blur(input);
    await waitFor(() => {
      const errorMessage = screen.getByText(/power must be a non-negative number/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('shows warning message for unsafe power update', async () => {
    renderWithProps();
    const input = screen.getByPlaceholderText('1000');
    fireEvent.change(input, { target: { value: '9000' } });
    fireEvent.blur(input);
    await waitFor(() => {
      const warningMessage = screen.getByText(/Warning: This power update may be unsafe/i);
      expect(warningMessage).toBeInTheDocument();
    });
  });
});
