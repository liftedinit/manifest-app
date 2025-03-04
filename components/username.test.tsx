import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'bun:test';
import React from 'react';

import { Username } from './username';

// Test the happy path of the username component
describe('Username', () => {
  afterEach(() => {
    cleanup();
  });
  test('renders Ledger correctly', () => {
    render(<Username walletName="Ledger" username="NOT LEDGER" />);
    expect(screen.getByText('Ledger HSM')).toBeInTheDocument();
    // This will be a title attribute.
    expect(screen.queryByText('NOT LEDGER')).not.toBeInTheDocument();
    expect(screen.queryByTitle('NOT LEDGER')).toBeInTheDocument();
  });

  test('renders correctly', () => {
    render(<Username walletName="AnyOther" username="Some Username" />);
    expect(screen.getByText('Some Username')).toBeInTheDocument();
    expect(screen.getByTitle('Some Username')).toBeInTheDocument();
  });

  test('renders correctly with truncated', () => {
    render(<Username walletName="AnyOther" username="Some Username" truncated />);
    expect(screen.getByText('Some U...ername')).toBeInTheDocument();
    expect(screen.getByTitle('Some Username')).toBeInTheDocument();
  });

  test('renders correctly with no username', () => {
    render(<Username />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByTitle('Anonymous')).toBeInTheDocument();
  });

  test('renders correctly with no walletName', () => {
    render(<Username username="Some Username" />);
    expect(screen.getByText('Some Username')).toBeInTheDocument();
    expect(screen.getByTitle('Some Username')).toBeInTheDocument();
  });

  test('renders correctly with no username and truncated', () => {
    render(<Username truncated />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByTitle('Anonymous')).toBeInTheDocument();
  });

  test('renders correctly with no walletName and truncated', () => {
    render(<Username username="Some Very Very Long Username" truncated />);
    expect(screen.getByText('Some V...ername')).toBeInTheDocument();
    expect(screen.queryByText('Some Very Very Long Username')).not.toBeInTheDocument();
    expect(screen.getByTitle('Some Very Very Long Username')).toBeInTheDocument();
  });
});
