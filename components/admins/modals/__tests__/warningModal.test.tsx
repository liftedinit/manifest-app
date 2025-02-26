import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { WarningModal } from '@/components/admins/modals/warningModal';
import { renderWithChainProvider } from '@/tests/render';

mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const admin = 'manifest1adminaddress';
const address = 'manifest1validatoraddress';
const moniker = 'Validator Moniker';
const modalId = 'test-modal';

function renderWithProps(props = {}) {
  return renderWithChainProvider(
    <WarningModal
      openWarningModal={true}
      setOpenWarningModal={() => {}}
      admin={admin}
      address={address}
      moniker={moniker}
      modalId={modalId}
      isActive={true}
      {...props}
    />
  );
}

describe('WarningModal Component', () => {
  afterEach(cleanup);

  test('renders modal with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Are you sure you want to remove the validator')).toBeInTheDocument();
    expect(screen.getByText(moniker)).toBeInTheDocument();
    expect(screen.getByText('from the active set?')).toBeInTheDocument();
  });

  test('displays correct text based on isActive prop', () => {
    renderWithProps();
    expect(screen.getByText('Remove From Active Set')).toBeInTheDocument();

    cleanup();

    renderWithProps({ isActive: false });
    expect(screen.getByText('Remove From Pending List')).toBeInTheDocument();
  });

  // // TODO: Why is this test failing?
  // // https://github.com/capricorn86/haVyppy-dom/issues/1184
  // test('closes modal when close button is clicked', async () => {
  //   renderWithProps();
  //   const closeButton = screen.getByText('✕');
  //   fireEvent.click(closeButton);
  //   await waitFor(() => expect(screen.queryByText('Are you sure you want to remove the validator')).not.toBeInTheDocument());
  // });
});
