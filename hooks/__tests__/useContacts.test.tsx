import { test, expect, beforeEach, afterEach, describe, jest } from 'bun:test';
import { cleanup, render, waitFor } from '@testing-library/react';
import { ContactsContext, ContactsContextType, ContactsProvider, useContacts } from '@/hooks';
import React, { useContext } from 'react';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend({ ...matchers });

function TestComponent() {
  const { contacts, addContact, removeContact, updateContact } = useContacts();

  return (
    <>
      <div>
        <div data-testid="contact-count">{contacts.length}</div>
        <div data-testid="contact-list">
          {contacts.map((contact, index) => (
            <div key={index}>
              <div data-testid={`contact-name-${index}`}>{contact.name}</div>
              <div data-testid={`contact-address-${index}`}>{contact.address}</div>
              <div>
                <button
                  data-testid={`contact-remove1-${index}`}
                  onClick={() => removeContact(index)}
                >
                  Remove by index
                </button>
                <button
                  data-testid={`contact-remove2-${index}`}
                  onClick={() => removeContact({ name: contact.name })}
                >
                  Remove by name
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <input data-testid="contact-name" />
        <input data-testid="contact-address" />
        <button
          data-testid="contact-add"
          onClick={() => {
            addContact({
              name: (document.querySelector('[data-testid="contact-name"]') as HTMLInputElement)
                .value,
              address: (
                document.querySelector('[data-testid="contact-address"]') as HTMLInputElement
              ).value,
            });
          }}
        >
          Add
        </button>
      </div>
    </>
  );
}

describe('useContacts', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  test('works', async () => {
    const wrapper = render(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );
    expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');

    wrapper.getByTestId('contact-name').value = 'Alice';
    wrapper.getByTestId('contact-address').value =
      'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('1');
      expect(wrapper.getByTestId('contact-name-0')).toHaveTextContent('Alice');
      expect(wrapper.getByTestId('contact-address-0')).toHaveTextContent(
        'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf'
      );
    });

    wrapper.getByTestId('contact-name').value = 'Bob';
    wrapper.getByTestId('contact-address').value =
      'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => expect(wrapper.getByTestId('contact-count')).toHaveTextContent('2'));
  });

  test('only allows valid Bech32 addresses', async () => {
    // Disable console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = render(
      <ContactsProvider>
        <TestComponent />
      </ContactsProvider>
    );
    expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');

    wrapper.getByTestId('contact-name').value = 'Alice';
    wrapper.getByTestId('contact-address').value = 'invalid Bech32';

    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');
    });
  });

  test('removes contact by index', async () => {
    const wrapper = render(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );
    expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');

    wrapper.getByTestId('contact-name').value = 'Alice';
    wrapper.getByTestId('contact-address').value =
      'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('1');
    });

    wrapper.getByTestId('contact-remove1-0').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');
    });
  });

  test('adding existing address updates it', async () => {
    const wrapper = render(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );
    expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');

    wrapper.getByTestId('contact-name').value = 'Alice';
    wrapper.getByTestId('contact-address').value =
      'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('1');
      expect(wrapper.getByTestId('contact-name-0')).toHaveTextContent('Alice');
      expect(wrapper.getByTestId('contact-address-0')).toHaveTextContent(
        'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf'
      );
    });

    wrapper.getByTestId('contact-name').value = 'Not Alice';
    wrapper.getByTestId('contact-address').value =
      'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => {
      expect(wrapper.getByTestId('contact-count')).toHaveTextContent('1');
      expect(wrapper.getByTestId('contact-name-0')).toHaveTextContent('Not Alice');
      expect(wrapper.getByTestId('contact-address-0')).toHaveTextContent(
        'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf'
      );
    });
  });
});
