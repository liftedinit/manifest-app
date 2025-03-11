import { cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import { ContactsModal } from '@/components';
import { ContactsContext, ContactsContextType } from '@/hooks';
import { clearAllMocks, mockRouter } from '@/tests';
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

describe('ContactsModal', () => {
  beforeEach(() => {
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('works', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const mockup = renderWithChainProvider(
      <ContactsContext.Provider value={contacts}>
        <ContactsModal onSelect={onSelect} open onClose={onClose} />
      </ContactsContext.Provider>
    );

    expect(mockup.getByText('Alice')).toBeInTheDocument();
    expect(mockup.getByText('Bob')).toBeInTheDocument();
    fireEvent.click(mockup.getByText('Alice'));
    expect(onSelect).toHaveBeenCalledWith('0x123');
    expect(onClose).toHaveBeenCalledWith();
  });
});
