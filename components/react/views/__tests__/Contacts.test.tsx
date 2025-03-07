import { cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, spyOn, test } from 'bun:test';
import React from 'react';

import { ContactsModal } from '@/components';
import { ContactsContext, ContactsContextType } from '@/hooks';
import { renderWithChainProvider } from '@/tests/render';

const contacts: ContactsContextType = {
  exportContacts: jest.fn(),
  importContacts: jest.fn(),
  updateContact: jest.fn(),
  contacts: [
    { name: 'Alice', address: '0x123' },
    { name: 'Bob', address: '0x456' },
  ],
  addContact: jest.fn(),
  removeContact: jest.fn(),
};

// TODO: this test suite should not need to mock the router, but somehow it does.
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

describe('ContactsModal', () => {
  afterEach(cleanup);

  test('works', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const mockup = renderWithChainProvider(
      <ContactsContext.Provider value={contacts}>
        <ContactsModal onSelect={onSelect} open onClose={() => {}} />
      </ContactsContext.Provider>
    );

    expect(mockup.getByText('Alice')).toBeInTheDocument();
    expect(mockup.getByText('Bob')).toBeInTheDocument();
    fireEvent.click(mockup.getByText('Alice'));
    expect(onSelect).toHaveBeenCalledWith('0x123');
    expect(onClose).not.toHaveBeenCalledWith();
  });
});
