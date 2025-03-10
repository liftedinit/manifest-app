import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import React from 'react';

import { ContactsProvider, STORAGE_KEY, useContacts } from '@/hooks';
import { formatComponent } from '@/tests';

function TestComponent() {
  const { contacts, addContact, removeContact } = useContacts();

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

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Alice';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value =
      'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf';
    fireEvent.click(wrapper.getByTestId('contact-add'));

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

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Bob';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value =
      'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct';
    wrapper.getByTestId('contact-add').click();

    wrapper.rerender(
      <ContactsProvider>
        <TestComponent />)
      </ContactsProvider>
    );

    await waitFor(() => expect(wrapper.getByTestId('contact-count')).toHaveTextContent('2'));

    expect(formatComponent(wrapper.asFragment())).toMatchSnapshot();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toMatchSnapshot();
  });

  test('only allows valid Bech32 addresses', async () => {
    // Disable console.error
    spyOn(console, 'error');

    const wrapper = render(
      <ContactsProvider>
        <TestComponent />
      </ContactsProvider>
    );
    expect(wrapper.getByTestId('contact-count')).toHaveTextContent('0');

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Alice';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value = 'invalid Bech32';

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

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Alice';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value =
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

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Alice';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value =
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

    (wrapper.getByTestId('contact-name') as HTMLInputElement).value = 'Not Alice';
    (wrapper.getByTestId('contact-address') as HTMLInputElement).value =
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
