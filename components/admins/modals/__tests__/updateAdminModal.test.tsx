import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { UpdateAdminModal } from '@/components/admins/modals/updateAdminModal';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const modalId = 'test-modal';
const admin = 'manifest1adminaddress';
const userAddress = 'manifest1useraddress';
const validAddress = 'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct';
const allowExit = true;

function renderWithProps(props = {}) {
  return renderWithChainProvider(
    <UpdateAdminModal
      modalId={modalId}
      admin={admin}
      userAddress={userAddress}
      allowExit={allowExit}
      {...props}
    />
  );
}

describe('UpdateAdminModal Component', () => {
  afterEach(cleanup);

  test('renders modal with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Update Admin')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Currently, the admin is set to a group policy address. While the admin can be any manifest1 address, it is recommended to set the new admin to another group policy address.'
      )
    ).toBeInTheDocument();
  });

  test('updates input field correctly', async () => {
    renderWithProps();
    const input = screen.getByLabelText('Admin Address');
    fireEvent.change(input, { target: { value: validAddress } });
    await waitFor(() => {
      expect(input).toHaveValue(validAddress);
    });
  });

  test('disables update button when input is invalid', async () => {
    renderWithProps();
    const input = screen.getByLabelText('Admin Address');
    const updateButton = screen.getByText('Update');
    expect(updateButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'invalidaddress' } });
    await waitFor(() => {
      expect(updateButton).toBeDisabled();
    });
  });

  test('enables update button when input is valid', async () => {
    renderWithProps();
    const updateButton = screen.getByText('Update');
    expect(updateButton).toBeDisabled();
    const input = screen.getByLabelText('Admin Address');
    fireEvent.change(input, { target: { value: validAddress } });
    await waitFor(() => {
      expect(updateButton).toBeEnabled();
    });
  });

  test('accepts valid manifest1 address', async () => {
    renderWithProps();
    const input = screen.getByLabelText('Admin Address');
    const longValidAddress = 'manifest1' + 'a'.repeat(38);
    fireEvent.change(input, { target: { value: longValidAddress } });
    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid manifest1 address (at least 38 characters long)')
      ).not.toBeInTheDocument();
    });
  });

  // // TODO: Why is this test failing?
  // // https://github.com/capricorn86/haVyppy-dom/issues/1184
  // test('closes modal when close button is clicked', async () => {
  //   renderWithProps();
  //   const closeButton = screen.getByText('✕');
  //   fireEvent.click(closeButton);
  //   await waitFor(() => expect(screen.queryByText('Update Admin')).not.toBeInTheDocument());
  // });
});
