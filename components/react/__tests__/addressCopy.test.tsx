import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { Contacts, TruncatedAddressWithCopy } from '@/components';
import { ContactsContext, ContactsContextType } from '@/hooks';
import { formatComponent } from '@/tests';

describe('TruncatedAddressWithCopy', () => {
  afterEach(cleanup);

  test('should render', () => {
    const wrapper = render(
      <TruncatedAddressWithCopy address="manifest123456789012345678901234567890" />
    );
    expect(screen.getByText('manifest1234567890123456...')).toBeInTheDocument();

    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should show name and address', () => {
    const contactContext: ContactsContextType = {
      contacts: [{ address: 'manifest123456789012345678901234567890', name: 'Test Contact' }],
      addContact: jest.fn(),
      updateContact: jest.fn(),
      removeContact: jest.fn(),
      importContacts: jest.fn(),
      exportContacts: jest.fn(),
    };

    const wrapper = render(
      <ContactsContext.Provider value={contactContext}>
        <TruncatedAddressWithCopy address="manifest123456789012345678901234567890" />
      </ContactsContext.Provider>
    );
    expect(screen.getByText(/^Test Contact \(manifest1234567890123456\.\.\./)).toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should not show name when showName is false', () => {
    const contactContext: ContactsContextType = {
      contacts: [{ address: 'manifest123456789012345678901234567890', name: 'Test Contact' }],
      addContact: jest.fn(),
      updateContact: jest.fn(),
      removeContact: jest.fn(),
      importContacts: jest.fn(),
      exportContacts: jest.fn(),
    };

    const wrapper = render(
      <ContactsContext.Provider value={contactContext}>
        <TruncatedAddressWithCopy
          showName={false}
          address="manifest123456789012345678901234567890"
        />
      </ContactsContext.Provider>
    );
    expect(screen.getByText(/manifest1234567890123456\.\.\./)).toBeInTheDocument();
    expect(screen.queryByText(/Test Contact/)).not.toBeInTheDocument();
    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
  });

  test('should allow to copy address', async () => {
    const wrapper = render(
      <TruncatedAddressWithCopy address="manifest123456789012345678901234567890" />
    );

    // The element itself switches, so we need to re-query the document once the button is clicked.
    const svgButton = document.querySelector('svg[data-icon="copy"]')!;
    fireEvent.click(svgButton);

    await waitFor(() => {
      const svgButton2 = document.querySelector('svg[data-icon="check"]')!;
      expect(svgButton2).toBeInTheDocument();
    });
  });

  test('should show truncated address with proper slice character count', () => {
    const wrapper = render(
      <TruncatedAddressWithCopy address="manifest123456789012345678901234567890" slice={10} />
    );
    expect(screen.getByText('manifest12...')).toBeInTheDocument();
  });
});
